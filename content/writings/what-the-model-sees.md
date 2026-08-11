---
title: "What the Model Sees"
date: "2023-08-15"
color: "blue"
---

A machine generated a photograph this week. No light passed through a lens and no sensor captured a scene, and the result is indistinguishable to the human eye from a photograph. A face, with specific features, specific lighting, specific imperfections. A face that has never existed, depicting a person who has never lived, rendered with a fidelity that makes detection unreliable even for trained observers.

This is new in a way most technology isn't. Usually a capability extends what came before by some increment. Here a boundary has been crossed - the one between what happened and what could have happened, between the captured and the fabricated.

The implications are hard to overstate, and I want to trace them carefully, because I think they run further than the immediate concerns about deepfakes and misinformation that dominate the coverage.

Start with the obvious. If a machine can generate a convincing image of something that never occurred, the evidentiary value of images has collapsed. A photograph used to be a form of proof. Never perfect proof - images have been manipulated since the medium was invented - but proof in the general sense that a photograph's existence created a strong presumption the scene had occurred. Courts admitted them. Journalism relied on them. Personal photographs served as proof of memory: you were here, this happened, this is what it looked like.

That presumption is finished. Any image can be fabricated now, by anyone, at no cost, at a quality that defeats detection. A politician at a meeting that never happened. A building that never existed. Your face doing something you never did. The technology requires no expertise at all. It requires a prompt.

Video is already following. The quality is lower and the artefacts more visible, and the trajectory is unmistakable - within a year or two the fabrication of convincing video will be as accessible as convincing images are today. At that point the medium we currently trust most as documentation follows photography down the same path, from proof to suggestion, from evidence to ambiguity.

**Worse Than Having Nothing**

The deeper problem is epistemic. For roughly a century and a half we've relied on recorded media as a bridge between experience and knowledge. I wasn't at the event, but I saw the photograph. I wasn't in the room, but I watched the video. Recorded media served as a proxy for presence, extending the reach of individual experience far past the limits of direct observation.

That bridge is becoming unreliable, and an unreliable bridge is a different problem from no bridge at all. Before photography, people relied on testimony, written accounts, and the judgement of observers whose credibility was assessed individually. The absence of recorded media didn't prevent knowledge. It channelled knowledge through other means, and everyone understood which means they were using.

Unreliable recorded media is worse than its absence, and I think this is the point most commentary misses. It creates a world where any recorded evidence can be both presented and denied. Any photograph claimed as real or dismissed as fabricated. Any video offered as proof or rejected as generated. What we get is a world where evidence has lost the ability to settle disputes, and the settlement of disputes through shared evidence is one of the foundations democratic society rests on.

There's something more personal underneath that, and I find it harder to articulate.

I think about memory. My own is unreliable in the way all human memory is unreliable - reconstructive rather than reproductive, editing itself with each retrieval, filling gaps with plausible invention. I have photographs from my travels. Forty-five countries, hundreds of images. When I look at them they do something specific: they anchor memory, providing a fixed point against which the drift of recollection can be checked. I was here. This is what it looked like. The photograph is proof against the ordinary erosion of recall.

If photographs can be fabricated, that anchoring function weakens - and it weakens even though my own photographs are real, because the existence of fabrication as a possibility introduces doubt into the relationship between an image and a memory. The photograph used to be a window into the past. It's becoming a mirror that might show the past or might show something else, and the difference is no longer legible from the image itself.

**Provenance, Not Detection**

The response nearly everyone is reaching for is detection - build classifiers that spot generated content and label it. I think that's the wrong direction, and I'd rather say so now than after a decade of investment. Detection is an arms race between two systems trained on the same mathematics, and the generator wins, because the generator only has to fool the detector while the detector has to be right in public, at scale, on content that has been compressed and cropped and re-uploaded four times.

The direction that can actually work is provenance rather than detection. Sign the image at the point of capture, in the camera hardware, with a cryptographic chain recording where it was made and every edit since. Then the question stops being whether an image looks real and becomes whether it carries a signature you can verify.

I'd argue for it now, ahead of a crisis, for a reason that has nothing to do with the technology. Provenance only works if it's built into the capture devices, and capture devices have long replacement cycles. A standard agreed in 2023 reaches most of the world's cameras around 2030. A standard agreed after the first election overturned by a fabricated video reaches them around 2040, and the intervening decade is the one where it matters most.

The models see everything and nothing. They can generate any image and can't attest to any truth. They're mirrors reflecting whatever prompt they're given, with no commitment to what actually occurred, and the gap between what the model sees and what is real is a feature of the architecture rather than a flaw awaiting correction. The model doesn't know what's real. It knows what's probable, and probability turns out to be a poor substitute for truth.

We built these tools to generate content. We may have accidentally built tools that dissolve the boundary between what happened and what could have happened. The consequences aren't clear yet, and they will be, and by the time they're clear the boundary will be gone. Which is the whole argument for acting while it still seems early.
