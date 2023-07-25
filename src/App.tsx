import {
	type Component,
	createResource,
	Suspense,
	createEffect,
	onCleanup,
	createSignal,
	on,
} from "solid-js";
import { Timelapser } from "./Components/Timelapser";
const App: Component = () => {
	return <Timelapser />;
};

export default App;
