import { randomInt } from "@amarillion/helixgraph/lib/random.js";
import { prim, PRIM_LAST_ADDED } from "@amarillion/helixgraph";
import BaseGrid from "@amarillion/helixgraph/lib/BaseGrid.js";

const NE = "NE", N = "N", NW = "NW", SE = "SE", S = "S", SW = "SW"; 

// for being able to find the opposite direction
const reverse = {
	NE: SW,
	N: S,
	NW: SE,
	SE: NW,
	S: N,
	SW: NE,
};

const TRIANGLE_UP_DIRS = {
	NW: { w: 1, dx: -1, dy: 0 },
	NE: { w: 1, dx: 1, dy: 0 },
	S: { w: 1, dx: 0, dy: 1 }
};
const TRIANGLE_DOWN_DIRS = {
	N: { w: 1, dx: 0, dy: -1 },
	SE: { w: 1, dx: 1, dy: 0 },
	SW: { w: 1, dx: -1, dy: 0 },
};

class TriangleInfo {

	constructor(size, xofst, yofst) {
		this.xofst = xofst;
		this.yofst = yofst;

		// TRIANGLE properties
		const C = size; // side
		const A = C / 2; // half of a side
		const B = Math.sqrt(C * C - A * A); // perpendicular line

		this.C = C;
		this.A = A;
		this.B = B;

		const POINTS = [
			// up
			{ x: -A, y: B },
			{ x: 0, y: 0 },
			{ x: A, y: B },
			// down
			{ x: -A, y: 0 },
			{ x: A, y: 0 },
			{ x: 0, y: B },
		];

		this.POINTS = POINTS;
		this.SEGMENTS = {
			NW: [ POINTS[0], POINTS[1] ],
			N:  [ POINTS[3], POINTS[4] ],
			NE: [ POINTS[1], POINTS[2] ],
			SE: [ POINTS[4], POINTS[5] ],
			S:  [ POINTS[2], POINTS[0] ],
			SW: [ POINTS[5], POINTS[3] ]
		};

	}
}

// cell implementation that keeps track of links to neighboring cells
class TriangularCell {

	constructor(x, y, grid, layout) {
		this.x = x;
		this.y = y;
		this.grid = grid;
		this.pointingDown = (x % 2) !== (y % 2);
		
		this.links = {};
		this.points = this.pointingDown ? layout.POINTS.slice(3,6) : layout.POINTS.slice(0,3);
		this.dirs = this.pointingDown ? TRIANGLE_DOWN_DIRS : TRIANGLE_UP_DIRS;
		this.layout = layout;
	}

	/**
	 * @param {*} other cell to link to
	 * @param {*} dir one of NE, NW, E, SE, SW, W
	 * @param {*} reverse optional - supply a reverse direction if you want to make
	 *   the link bidirectional
	 */
	link(other, dir, reverse) {
		if (dir in this.links) {
			console.log("WARNING: creating link that already exists: ", { dir, reverse });
		}
		if (!(dir in this.dirs)) {
			throw new Error(`Creating link that mismatches triangle orientation: ${JSON.stringify({ x: this.x, y: this.y, dir, reverse })}`);
		}
		this.links[dir] = other;
		if (reverse) { 
			// call recursively, but without reversing again
			other.link(this, reverse); 
		}
	}

	linked(dir) {
		return dir in this.links;
	}

	//TODO: generator?
	*neighborFunc() {
		for (const [ key, { dx, dy } ] of Object.entries(this.dirs)) {
			const nx = this.x + dx;
			const ny = this.y + dy;
			if (!this.grid.inRange(nx, ny)) continue;
			const cell = this.grid.get(nx, ny);
			yield [key, cell];
		}
	}

	// TODO: rewrite as filter of neighborFunc
	undirectedNeighborFunc() {
		const result = [];
		for (const [ key, { dx, dy } ] of Object.entries(this.dirs)) {
			
			// key difference: filter
			if (key === S || key === SE || key === SW) continue;

			const nx = this.x + dx;
			const ny = this.y + dy;
			if (!this.grid.inRange(nx, ny)) continue;
			const cell = this.grid.get(nx, ny);
			result.push([key, cell]);
		}
		return result;
	}

	renderBg(ctx) {
		ctx.fillStyle = this.color || "white";
		ctx.lineWidth = 1.0;
		ctx.strokeStyle = ctx.fillStyle;
		ctx.beginPath();
		ctx.moveTo(this.px + this.points[0].x, this.py + this.points[0].y);
		for (const p of this.points.slice(1)) {
			ctx.lineTo(this.px + p.x, this.py + p.y);
		}
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}

	render(ctx) {
		ctx.lineWidth = 1.0;
		ctx.strokeStyle = "black";
		// ctx.lineCap = "round";
		for (const dir in this.dirs) {
			if (this.linked(dir)) continue;

			const segment = this.layout.SEGMENTS[dir];
			ctx.beginPath();
			ctx.moveTo(this.px + segment[0].x, this.py + segment[0].y);
			ctx.lineTo(this.px + segment[1].x, this.py + segment[1].y);
			ctx.stroke();
		}
	}

	get px() { return this.layout.xofst + this.layout.A * (this.x + 1); }
	get py() { return this.layout.yofst + this.y * this.layout.B; }
	
}

function snowflake(start, neighborFunc, linkCells, size, color) {

	const directionSteps = [
		[ NE, N ],
		[ NE, SE ],
		[ S, SE ],
		[ S, SW ],
		[ NW, SW ],
		[ NW, N ],
	];

	const particles = [
		{ node: start, dir: 0, ttl: size, branch: 0 },
		{ node: start, dir: 1, ttl: size, branch: 0 },
		{ node: start, dir: 2, ttl: size, branch: 0 },
		{ node: start, dir: 3, ttl: size, branch: 0 },
		{ node: start, dir: 4, ttl: size, branch: 0 },
		{ node: start, dir: 5, ttl: size, branch: 0 },
	];

	let branchCountdown = size / 4;
	let step = 0;
	while (particles.length > 0) {
		
		if (branchCountdown <= 0) {
			branchCountdown = randomInt(8) + 3;
			const primaryBranchLen = Math.min(size + 2 - step, randomInt(step-4) + 2); 
			const curLen = particles.length;
			for (let i = 0; i < curLen; ++i) {
				const p = particles[i];
				const ttl = p.branch === 0 ? primaryBranchLen : 2;
				particles.push({
					node: p.node,
					dir: ((p.dir + 1) % 6),
					ttl,
					branch: p.branch + 1
				});
				particles.push({
					node: p.node,
					dir: ((p.dir + 5) % 6),
					ttl,
					branch: p.branch + 1
				});
			}
		}
		branchCountdown--;
		step++;

		// iterate backwards so that we can splice some elements without affecting iteration
		for (let i = particles.length - 1; i >= 0; --i) {
			const p = particles[i];
			p.node.color = color;

			const desiredDir = directionSteps[p.dir][ p.node.pointingDown ? 1 : 0 ];
			let found = false;
			for (const [ dir, nextNode ] of neighborFunc(p.node)) {
				if (dir === desiredDir) {
					if (!p.node.linked(dir)) {
						linkCells(p.node, dir, nextNode);
					}
					p.node = nextNode;
					found = true;
					break;
				}
			}

			p.ttl -= 1;
			if (!found || p.ttl <= 0) {
				particles.splice(i,1);
			}
		}

	}
}

function evenlySpacedFlakes(width, height) {
	let flakes = [];
	let maxIt = 500;
	let colors = [ "aqua", "azure", "cyan", "blueviolet", "cornflowerblue", "blue", "plum", "PaleTurquoise", "lightblue", "turquoise", "violet" ];
	let numFlakes = colors.length;
	while (flakes.length < numFlakes) {
		let nx = randomInt(width - 10) + 5;
		let ny = randomInt(height - 10) + 5;
		let size = randomInt(60) + 12;
		let colliding = false;
		for(const flake of flakes) {
			let dx = flake.x - nx;
			let dy = (flake.y - ny) * 2;
			let dist = (flake.size + size) * 0.8;
			if (dx * dx + dy * dy < dist * dist) {
				colliding = true;
				break;
			}
		}
		if (!colliding) {
			flakes.push({
				x: nx,
				y: ny,
				size,
				color: colors.pop()
			});
		}
		
		if (--maxIt < 0) {
			break;
		}
	}
	return flakes;
}

export class MazeMaker {

	constructor(triangleSize, width, height, xofst, yofst) {
		const layout = new TriangleInfo(triangleSize, xofst, yofst);
		const cellFactory = (x, y, grid) => new TriangularCell(x, y, grid, layout);
		
		this.grid = new BaseGrid(
			Math.floor(width / layout.A) - 2, 
			Math.floor(height / layout.B), 
			// 120,
			// 40,
			cellFactory);
	}

	openCorners() {
		this.grid.get(1,0).links[N] = 1;
		const extra = (this.grid.width + this.grid.height) % 2;
		this.grid.get(this.grid.width - extra - 1, this.grid.height -1).links[S] = 1;
	}

	run() {
		const linkCells = (src, dir, dest) => { src.link(dest, dir, reverse[dir]); };
		
		const savedEdges = new Map();
		const saveEdge = (src, dir, dest) => {
			if (!savedEdges.has(src)) {
				savedEdges.set(src, new Set([dir]));
			}
			else {
				savedEdges.get(src).add(dir);
			}
			const reverseDir = reverse[dir];
			if (!savedEdges.has(dest)) {
				savedEdges.set(dest, new Set([reverseDir]));
			}
			else {
				savedEdges.get(dest).add(reverseDir);
			}
		};
	
		const flakes = evenlySpacedFlakes(this.grid.width, this.grid.height);
		// generate a snowflake
		for (const flake of flakes) {
			snowflake(this.grid.get(flake.x, flake.y), 
				n => [...n.neighborFunc()], 
				saveEdge,
				// (src, dir, dest) => kruskal.merge(src, dir, dest), 
				flake.size, 
				"white"
				// flake.color
			);
		}
	
	
		const myWeightFunc = (dir, src) => {
			if (savedEdges.has(src) && savedEdges.get(src).has(dir)) {
				return 1;
			}
			else {
				return 2;
			}
		};
	
		// generate maze
		prim(
			this.grid.randomCell(), // start cell
			n => n.neighborFunc(), 
			linkCells, { 
				getWeight: myWeightFunc,
				tiebreaker: PRIM_LAST_ADDED 
			}
		);
	
	}

	render(ctx) {
		for (const n of this.grid.eachNode()) {
			n.render(ctx);
		}

	}
}
