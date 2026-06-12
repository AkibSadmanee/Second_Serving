import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} Second Serving. All rights reserved.</span>
    </footer>
  );
}
