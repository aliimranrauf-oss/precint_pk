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
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <div className="btns">
          <Link href="/login" className="btn">Login</Link>
          <Link href="/dashboard/new" className="btn p">Post Ad</Link>
        </div>
      </div>
    </header>
  );
}
