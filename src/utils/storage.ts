export class StorageHandler {
	directoryHandle!: FileSystemDirectoryHandle;
	async init() {
		const handle = await navigator.storage.getDirectory();
		this.directoryHandle = handle;
	}
	async writeToFile(name: string, content: ImageData) {
		// if (!this.directoryHandle) await this.init();
		// const handle = await this.directoryHandle.getFileHandle(name, {
		// 	create: true,
		// });
		// const writable = await handle.createWritable();
		// await writable.write(content.data);
		// await writable.close();
	}
	async readFile(name: string) {
		if (!this.directoryHandle) await this.init();
		const handle = await this.directoryHandle.getFileHandle(name);
		const file = await handle.getFile();
		const contents = await file.arrayBuffer();
		return contents;
	}
}
