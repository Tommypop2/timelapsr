import { StorageHandler } from "./storage";

export class Frames {
	// The start of frames that are stored in memory (storing all in memory is asking for a disaster)
	// We can keep a rolling window of 100 frames in memory. The potential issue with this is GC times
	indexOffset: number = 0;
	// Current index of the frames in memory. Start at -1 because we increment before we use it
	memoryIndex: number = -1;
	// The current timelapse frames
	frames: { img: ImageData; timestamp: number }[] = [];
	storageHandler: StorageHandler;
	constructor() {
		this.storageHandler = new StorageHandler();
	}
	// async get(index: number) {
	// 	const realIndex = index - this.indexOffset;
	// 	return this.frames[realIndex];
	// }
	async next() {
		this.memoryIndex++;
		if (this.memoryIndex >= this.frames.length) {
			this.memoryIndex = 0;
		}
		const i = this.memoryIndex - this.indexOffset;
		return this.frames[i];
	}
	addFrame(img: ImageData) {
		this.frames.push({ img, timestamp: Date.now() });
	}
}
