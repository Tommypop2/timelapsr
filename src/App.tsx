import { Show, type Component, createSignal } from "solid-js";
import { Timelapser } from "./Components/Timelapser";
import { Frames } from "./utils/frames";
const App: Component = () => {
	const [canStart, setCanStart] = createSignal(false);
	const frames = new Frames();
	return (
		<>
			<Show when={!canStart()}>
				<button
					onClick={() => {
						setCanStart(true);
					}}
				></button>
			</Show>
			<Show when={canStart()}>
				<Timelapser frames={frames} />
			</Show>
		</>
	);
};

export default App;
