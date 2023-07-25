import { StorageHandler } from "./storage";

export class Frames {
	// The start of frames that are stored in memory (storing all in memory is asking for a disaster)
	// We can keep a rolling window of 100 frames in memory. The potential issue with this is GC times (should be fine unless the playback speed in insanely fast)
	indexOffset: number = 0;
	// Current starting index of the frames in memory. Start at -1 because we increment before we use it
	index: number = -1;
	// The current timelapse frames
	frames: { img: ImageData; timestamp: number }[] = [];
	storageHandler: StorageHandler;
	restarting: boolean = false;
	constructor(handle: FileSystemDirectoryHandle) {
		this.storageHandler = new StorageHandler(handle);
	}
	async next(): Promise<{ img: ImageData; timestamp: number }> {
		if (this.restarting) {
		}
		this.index++;
		const i = this.index - this.indexOffset;
		// if (i >= this.frames.length) {
		// 	this.index = 0;
		// }
		const frame = this.frames[i];
		if (!frame) {
			let buf: ArrayBuffer;
			try {
				buf = await this.storageHandler.readFile(`${this.index}`);
			} catch {
				// File doesn't exist, so we loop back to the start
				this.restarting = true;
				return this.next();
			}
			const img = new ImageData(new Uint8ClampedArray(buf), 1920, 1080);
			this.frames.push({ img, timestamp: Date.now() });
		}
		// Remove frame from start of array
		// this.frames.shift();
		// this.indexOffset++;
		return frame;
	}
	addFrame(img: ImageData) {
		this.frames.push({ img, timestamp: Date.now() });
		this.storageHandler.writeToFile(
			`${this.frames.length - 1 + this.indexOffset}`,
			img
		);
	}
}
