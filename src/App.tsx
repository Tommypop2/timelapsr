import {
	type Component,
	createResource,
	Suspense,
	createEffect,
	onMount,
	onCleanup,
	createSignal,
} from "solid-js";
// The time (in ms) between each frame
const SAMPLEINTERVAL = 1000;
const PLAYBACKINTERVAL = 100;
const App: Component = () => {
	// Canvas used for rendering content for the user
	let displayCanvas: HTMLCanvasElement | undefined;
	// Used for getting image data from the video
	const processingCanvas = document.createElement("canvas");

	const videoElement: HTMLVideoElement = document.createElement("video");
	// The current timelapse frames
	const frames: ImageData[] = [];
	const [framesExist, setFramesExist] = createSignal(false);
	// Set up video element
	videoElement.autoplay = true;
	const [stream] = createResource(async () => {
		return await navigator.mediaDevices.getUserMedia({
			video: {
				width: { ideal: 4096 },
				height: { ideal: 2160 },
			},
		});
	});
	// Set up capture
	createEffect(() => {
		const str = stream();
		if (!str) return;
		const videoSettings = str.getVideoTracks()[0].getSettings();
		videoElement.srcObject = str;
		// Match dimensions
		videoElement.width = videoSettings.width!;
		videoElement.height = videoSettings.height!;
		processingCanvas!.width = videoSettings.width!;
		processingCanvas!.height = videoSettings.height!;
		// Get context
		const ctx = processingCanvas!.getContext("2d", {
			willReadFrequently: true,
		});
		const interval = setInterval(() => {
			ctx?.clearRect(0, 0, videoElement.width, videoElement.height);
			ctx?.beginPath();
			ctx?.drawImage(videoElement, 0, 0);
			const imgData = ctx?.getImageData(
				0,
				0,
				videoElement.width,
				videoElement.height
			);
			if (!imgData) return;
			frames.push(imgData);
			setFramesExist(true);
		}, SAMPLEINTERVAL);
		onCleanup(() => clearInterval(interval));
	});
	// Playing back captured frames as a timelapse
	createEffect(() => {
		if (!framesExist()) return;
		let currentFrameInd = 0;
		displayCanvas!.width = frames[0].width;
		displayCanvas!.height = frames[0].height;
		const ctx = displayCanvas?.getContext("2d");
		const interval = setInterval(() => {
			if (!ctx || !frames.length) return;
			// Loop index back to 0 when we reach the end of the frames array
			if (currentFrameInd >= frames.length) currentFrameInd = 0;
			const frame = frames[currentFrameInd];
			ctx.beginPath();
			ctx.clearRect(0, 0, frame.width, frame.height);
			ctx.putImageData(frame, 0, 0);
			currentFrameInd++;
		}, PLAYBACKINTERVAL);
		onCleanup(() => clearInterval(interval));
	});
	return (
		<Suspense>
			<canvas ref={displayCanvas}></canvas>
		</Suspense>
	);
};

export default App;
