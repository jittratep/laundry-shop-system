// frontend/src/index.tsx
import { render } from "solid-js/web";
// import { Router } from "@solidjs/router";
import App from "./App"; // เปลี่ยนชื่อที่ import มา
import "./index.css";


const root = document.getElementById("root");
if (root) {
  // 💡 ลบ <Router> ออกจากตรงนี้ แล้วเรียกแค่ <App /> เพียวๆ ครับ
  render(() => <App />, root);
}