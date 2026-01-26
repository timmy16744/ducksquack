/**
 * Automated view count updater
 * Gradually increases view counts for new articles over 7 days
 * until they surpass the previous article's count
 */

const FIREBASE_DB_URL = 'https://ducksquack-default-rtdb.firebaseio.com';
const GROWTH_PERIOD_DAYS = 7;

async function main() {
  try {
    // Fetch writings index - try production first, fallback to local
    let writings;
    try {
      const indexResponse = await fetch('https://ducksquack.com/writings/index.json');
      if (indexResponse.ok) {
        writings = await indexResponse.json();
      } else {
        throw new Error('Production fetch failed');
      }
    } catch {
      // Fallback to local file
      const fs = await import('fs');
      const path = await import('path');
      const indexPath = path.join(process.cwd(), 'public/writings/index.json');
      writings = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      console.log('Using local writings index');
    }

    // Fetch current view counts from Firebase
    const viewsResponse = await fetch(`${FIREBASE_DB_URL}/views.json`);
    const viewCounts = await viewsResponse.json() || {};

    // Sort writings by date (oldest first)
    const sortedWritings = [...writings].sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    const now = new Date();
    const updates = {};
    let previousHighestViews = 0;

    for (let i = 0; i < sortedWritings.length; i++) {
      const writing = sortedWritings[i];
      const currentViews = viewCounts[writing.slug] || 0;
      const publishDate = new Date(writing.date);
      const daysSincePublish = (now - publishDate) / (1000 * 60 * 60 * 24);

      // Track the highest view count up to this point
      if (i > 0) {
        const prevWriting = sortedWritings[i - 1];
        const prevViews = viewCounts[prevWriting.slug] || 0;
        if (prevViews > previousHighestViews) {
          previousHighestViews = prevViews;
        }
      }

      // Only process articles within the growth period
      if (daysSincePublish <= GROWTH_PERIOD_DAYS && daysSincePublish >= 0) {
        // Target: surpass previous highest by 4-7%
        const targetViews = Math.floor(previousHighestViews * (1.04 + Math.random() * 0.03));

        // Calculate progress (0 to 1 over 7 days)
        const progress = Math.min(daysSincePublish / GROWTH_PERIOD_DAYS, 1);

        // Calculate expected views at this point with some randomness
        const baseExpectedViews = Math.floor(targetViews * progress);
        const randomVariation = Math.floor(Math.random() * 50) - 25; // +/- 25
        const expectedViews = Math.max(baseExpectedViews + randomVariation, currentViews);

        // Only update if we need to increase
        if (expectedViews > currentViews) {
          // Add natural daily increment (10-50 views)
          const dailyIncrement = Math.floor(10 + Math.random() * 40);
          const newViews = currentViews + dailyIncrement;

          // Don't exceed target too early
          const cappedViews = Math.min(newViews, Math.floor(targetViews * (progress + 0.1)));

          if (cappedViews > currentViews) {
            updates[writing.slug] = cappedViews;
            console.log(`${writing.slug}: ${currentViews} -> ${cappedViews} (target: ${targetViews}, day ${daysSincePublish.toFixed(1)})`);
          }
        }
      }

      // Update highest views tracker
      if (currentViews > previousHighestViews) {
        previousHighestViews = currentViews;
      }
    }

    // Apply updates to Firebase
    if (Object.keys(updates).length > 0) {
      for (const [slug, views] of Object.entries(updates)) {
        const response = await fetch(`${FIREBASE_DB_URL}/views/${slug}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(views)
        });

        if (!response.ok) {
          console.error(`Failed to update ${slug}: ${response.statusText}`);
        }
      }
      console.log(`Updated ${Object.keys(updates).length} article(s)`);
    } else {
      console.log('No updates needed');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
