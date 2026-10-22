import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <Link href="/" className="logo">Precinct<span>.pk</span></Link>
        <nav className="links">
          <Link href="/listings">Listings</Link>
          <Link href="/#rates">Rates</Link>
          <Link href="/#why">Kyun Precinct?</Link>
          <Link href="/#agents">Agents</Link>
        </nav>
        <div className="btns">
          <button className="btn">Login</button>
          <button className="btn p">Post Ad</button>
        </div>
      </div>
    </header>
  );
}
