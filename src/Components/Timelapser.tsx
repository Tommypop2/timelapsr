import {
	type Component,
	createResource,
	Suspense,
	createEffect,
	onCleanup,
	createSignal,
	on,
	createMemo,
} from "solid-js";
import { Frames } from "../utils/frames";
// The time (in ms) between each frame
const SAMPLEINTERVAL = 1000;
const PLAYBACKINTERVAL = 100;
const formatTime = (time: number) => {
	const date = new Date(time);
	const timeStr = date.toTimeString().slice(0, 8);
	const dateStr = date.toDateString();
	return `${dateStr} ${timeStr}`;
};
export const Timelapser: Component<{ frames: Frames }> = (props) => {
	// Canvas used for rendering content for the user
	let displayCanvas: HTMLCanvasElement | undefined;
	// Used for getting image data from the video
	const processingCanvas = document.createElement("canvas");

	const videoElement: HTMLVideoElement = document.createElement("video");
	const frames = props.frames;
	const [currentFrameIndex, setCurrentFrameIndex] = createSignal(0);
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
		displayCanvas!.width = videoSettings.width!;
		displayCanvas!.height = videoSettings.height!;
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
			frames.addFrame(imgData);
			setFramesExist(true);
		}, SAMPLEINTERVAL);
		onCleanup(() => clearInterval(interval));
	});
	const [currentFrameTimestamp, setCurrentFrameTimestamp] =
		createSignal<number>();
	// Playing back captured frames as a timelapse
	createEffect(() => {
		if (!framesExist()) return;
		const ctx = displayCanvas?.getContext("2d");
		const interval = setInterval(async () => {
			if (!ctx || !frames.frames.length) return;
			const frame = await frames.next();
			queueMicrotask(() => setCurrentFrameTimestamp(frame.timestamp));
			ctx.beginPath();
			ctx.clearRect(0, 0, frame.img.width, frame.img.height);
			ctx.putImageData(frame.img, 0, 0);
		}, PLAYBACKINTERVAL);
		onCleanup(() => clearInterval(interval));
	});
	const timeString = createMemo((i) => {
		const timeStamp = currentFrameTimestamp();
		if (!timeStamp) return "No frames yet";
		return formatTime(timeStamp);
	});
	return (
		<Suspense>
			<div class="absolute">
				<div class="fixed top-8 right-8 text-xl">Date: {timeString()}</div>
				<canvas ref={displayCanvas}></canvas>
			</div>
		</Suspense>
	);
};
