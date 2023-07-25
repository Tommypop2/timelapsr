import { StorageHandler } from "./storage";

export class Frames {
	// The start of frames that are stored in memory (storing all in memory is asking for a disaster)
	// We can keep a rolling window of 100 frames in memory. The potential issue with this is GC times
	indexOffset: number = 0;
	// The current timelapse frames
	frames: { img: ImageData; timestamp: number }[] = [];
	storageHandler: StorageHandler;
	constructor() {
		this.storageHandler = new StorageHandler();
	}
	async get(index: number) {
		const realIndex = index - this.indexOffset;
		if (realIndex < 0) {
			// Assume we're restarting from the beginning of the timelapse
			this.indexOffset = 0;
			const fileContents = await this.storageHandler.readFile("0");
			this.frames = [
				{
					img: new ImageData(new Uint8ClampedArray(fileContents), 1920, 1080),
					timestamp: Date.now(),
				},
			];
		}
		if (realIndex >= this.frames.length) {
			// We're trying to access further than we've got in memory
			let fileContents: ArrayBuffer;
			try {
				fileContents = await this.storageHandler.readFile(index.toString());
			} catch (e) {
				return;
			}
			this.frames = [
				{
					img: new ImageData(new Uint8ClampedArray(fileContents), 1920, 1080),
					timestamp: Date.now(),
				},
			];
			this.indexOffset = index;
		}
		return this.frames[realIndex];
	}
	addFrame(img: ImageData) {
		this.frames.push({ img, timestamp: Date.now() });
	}
}
