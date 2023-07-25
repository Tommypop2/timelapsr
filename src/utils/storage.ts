export class StorageHandler {
	directoryHandle: FileSystemDirectoryHandle;
	constructor(dirHandle: FileSystemDirectoryHandle) {
		this.directoryHandle = dirHandle;
	}
	async writeToFile(name: string, content: ImageData) {
		const handle = await this.directoryHandle.getFileHandle(name, {
			create: true,
		});
		const writable = await handle.createWritable();
		await writable.write(content.data.buffer);
		await writable.close();
	}
	async readFile(name: string) {
		const handle = await this.directoryHandle.getFileHandle(name, {
			create: false,
		});
		const file = await handle.getFile();
		const contents = await file.arrayBuffer();
		return contents;
	}
}
