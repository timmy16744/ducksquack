// Magnet cabinet for IKEA Skådis
// Hangs on the board with 4 printed hooks; each magnet type lives in its own
// slide-out drawer with a labelled front. Add drawers by adding a line to MAGNETS.
//
//   openscad -D 'part="carcass"' -o stl/carcass.stl magnet_cabinet.scad
//   part = assembly | carcass | drawer | coupon     (drawer uses drawer_index)

part         = "assembly";
drawer_index = 0;
$fn          = 40;

// ---------- Skådis (check with the coupon before printing the carcass) ----------
board_t = 5.0;    // board thickness
slot_w  = 5.0;    // slot width
slot_h  = 15.0;   // slot height
pitch   = 40;     // hole pitch (same row / same column)
fit     = 0.35;   // hook is this much thinner than the slot; raise if too tight

hook_w   = slot_w - fit;
gap      = 0.3;   // plate -> board face
behind   = 0.3;   // play behind the board
stem_h   = 9;     // stem height (rests on bottom edge of slot)
lip_len  = 4;     // lip hangs this far below the stem
lip_d    = 2.4;   // lip thickness
hook_ytip = -(gap + board_t + behind + lip_d);

// ---------- Cabinet ----------
W        = 80;    // 2 x pitch, so cabinets tile on the board
n_cells  = 4;     // drawer slots
cell_pitch = 20;  // 4 x 20 = 80 tall = 2 x pitch
shelf    = 1.6;
side     = 2.4;
back     = 3.0;
H        = n_cells * cell_pitch;
cell_h   = cell_pitch - shelf * (n_cells + 1) / n_cells;

// ---------- Drawers ----------
dclr     = 0.3;                 // slide clearance
dw       = W - 2 * side - 2 * dclr;
tray_d   = 66;
panel_t  = 4;
panel_h  = cell_h - 0.5;
dl       = tray_d + panel_t;
floor_t  = 1.2;
wall     = 1.2;                 // between pockets
mag_clr  = 0.2;                 // per side around each magnet
D        = back + dl + 0.2;

// name, spec line, shape, a, b, thickness, stack, cols, rows
// rect: a x b footprint (a along y), disc: diameter a. Measure yours with calipers.
MAGNETS = [
  ["BLOCK",    "30x10x6  MAX", "rect", 30, 10, 6, 1,  6, 2],
  ["DISC",     "8x3  MAX",     "disc",  8,  8, 3, 4,  7, 3],
  ["ADHESIVE", "15x15x1  MED", "rect", 15, 15, 1, 10, 4, 2],
];

module hook(z0) {
  rotate([90, 0, 90])
    linear_extrude(height = hook_w, center = true)
      polygon([[1, z0 + stem_h], [hook_ytip, z0 + stem_h],
               [hook_ytip, z0 - lip_len + 1], [hook_ytip + 1, z0 - lip_len],
               [hook_ytip + lip_d, z0 - lip_len], [hook_ytip + lip_d, z0], [1, z0]]);
}

module hooks(x_mid, z_low) {
  for (dx = [-pitch / 2, pitch / 2], dz = [0, pitch])
    translate([x_mid + dx, 0, 0]) hook(z_low + dz);
}

module carcass() {
  difference() {
    cube([W, D, H]);
    for (i = [0 : n_cells - 1])
      translate([side, back, shelf + i * (cell_h + shelf)])
        cube([W - 2 * side, D, cell_h]);
    // detent dimples where the drawer bumps sit when closed
    for (i = [0 : n_cells - 1], x = [side, W - side])
      translate([x, back + 0.2 + 6, shelf + i * (cell_h + shelf) + 0.25 + 3])
        sphere(r = 0.7, $fn = 16);
  }
  hooks(W / 2, 12);
}

module pocket(shape, a, b, depth, hole) {
  if (shape == "disc") {
    cylinder(d = a + 2 * mag_clr, h = depth + 1);
    translate([0, 0, -floor_t - 1]) cylinder(d = hole, h = floor_t + 2);
  } else {
    translate([-(b + 2 * mag_clr) / 2, -(a + 2 * mag_clr) / 2, 0])
      cube([b + 2 * mag_clr, a + 2 * mag_clr, depth + 1]);
    translate([0, 0, -floor_t - 1]) cylinder(d = hole, h = floor_t + 2);
  }
}

module drawer(m) {
  name = m[0]; spec = m[1]; shape = m[2]; a = m[3]; b = m[4];
  thk = m[5]; stack = m[6]; cols = m[7]; rows = m[8];
  pw = (shape == "disc" ? a : b) + 2 * mag_clr;   // across x
  pl = a + 2 * mag_clr;                           // along y
  depth  = thk * stack + 0.8;
  tray_h = floor_t + depth;
  tot_w = cols * pw + (cols + 1) * wall;
  tot_l = rows * pl + (rows + 1) * wall;
  assert(tot_w <= dw, str(name, ": pockets too wide ", tot_w, " > ", dw));
  assert(tot_l <= tray_d, str(name, ": pockets too deep ", tot_l, " > ", tray_d));
  assert(tray_h <= cell_h - 0.5, str(name, ": stack too tall"));
  ox = (dw - tot_w) / 2 + wall + pw / 2;
  oy = (tray_d - tot_l) / 2 + wall + pl / 2;
  hole = min(pw, pl) * 0.45;

  difference() {
    union() {
      cube([dw, tray_d, tray_h]);
      translate([0, tray_d, 0]) cube([dw, panel_t, panel_h]);
      // raised label, readable from the front
      translate([dw - 4, dl + 0.6, 9.2]) rotate([90, 0, 0]) mirror([1, 0, 0])
        linear_extrude(0.6 + 0.01) text(name, size = 5.2, font = "Liberation Sans:style=Bold");
      translate([dw - 4, dl + 0.6, 3.0]) rotate([90, 0, 0]) mirror([1, 0, 0])
        linear_extrude(0.6 + 0.01) text(spec, size = 3.4, font = "Liberation Sans");
      // detent bumps
      for (x = [0.15, dw - 0.15]) translate([x, 6, 3]) sphere(r = 0.6, $fn = 16);
    }
    for (c = [0 : cols - 1], r = [0 : rows - 1])
      translate([ox + c * (pw + wall), oy + r * (pl + wall), floor_t])
        pocket(shape, a, b, depth, hole);
    // finger dimple
    translate([10, dl + 0.01, panel_h / 2]) rotate([90, 0, 0])
      cylinder(d = 11, h = 2.4, center = false);
  }
}

module coupon() {
  cube([60, 3, 66]);
  hooks(30, 10);
}

module assembly() {
  color("#8a8f98") carcass();
  for (i = [0 : len(MAGNETS) - 1])
    color(["#d94b4b", "#3b7dd8", "#e0a030"][i % 3])
      translate([side + dclr, back + 0.2 + (i == 0 ? 30 : 0),
                 shelf + (n_cells - 1 - i) * (cell_h + shelf) + 0.25])
        drawer(MAGNETS[i]);
}

if (part == "assembly")    assembly();
else if (part == "carcass") rotate([0, -90, 0]) carcass();   // print on its side wall
else if (part == "coupon")  rotate([0, -90, 0]) coupon();
else if (part == "drawer")  drawer(MAGNETS[drawer_index]);
