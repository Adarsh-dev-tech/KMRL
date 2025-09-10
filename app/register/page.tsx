import Image from "next/image"
import Link from "next/link"
import RegisterForm from "@/components/RegisterForm"

export default function RegisterPage() {
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

      <div className="register-container">
        <div className="register-box">
          <h2>Register User</h2>
          <h3>New User</h3>
          <RegisterForm />
          <div className="form-links">
            <Link href="/" className="login-link">
              Already have an account? Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
