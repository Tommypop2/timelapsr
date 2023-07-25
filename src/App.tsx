import { Show, type Component, createSignal } from "solid-js";
import { Timelapser } from "./Components/Timelapser";
import { Frames } from "./utils/frames";
const App: Component = () => {
	const [canStart, setCanStart] = createSignal(false);
	let frames: Frames | null = null;
	return (
		<>
			<Show when={!canStart()}>
				<button
					onClick={async () => {
						// @ts-ignore
						const dirHandle = await window.showDirectoryPicker();
						frames = new Frames(dirHandle);
						setCanStart(true);
					}}
				></button>
			</Show>
			<Show when={canStart() && frames}>
				<Timelapser frames={frames!} />
			</Show>
		</>
	);
};

export default App;
