import Image from "next/image"
import Link from "next/link"
import LoginForm from "@/components/LoginForm"

export default function LoginPage() {
  return (
    <div className="container">
      <header className="header">
        <div className="logo-section">
          <Image src="img/KMRL-logo-300x165.jpg" alt="KMRL Logo" width={165} height={60} className="logo" />
        </div>
        <nav className="nav-links">
          <Link href="#help">Help</Link>
          <Link href="#contact">Contact Us</Link>
        </nav>
      </header>

      <div className="banner-section">
        <Image src="/img/JAP_7896.jpg" alt="Banner" fill className="banner-image" style={{ objectFit: "cover" }} />
        <div className="banner-overlay">
          <h1>Welcome Back!</h1>
        </div>
      </div>

      <div className="login-container">
        <div className="login-box">
          <h2>User Login</h2>
          <LoginForm />
          <div className="form-links">
            <Link href="#" className="forgot-link">
              Forgot Password?
            </Link>
            <span className="separator">|</span>
            <Link href="/register" className="register-link">
              Don't have account? Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
