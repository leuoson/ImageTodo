import "./App.css";

import { TodoList } from "@/components/features";

function App() {
  return (
    <main className="app-board" role="main" aria-label="Todo board">
      <TodoList />
    </main>
  );
}

export default App;
