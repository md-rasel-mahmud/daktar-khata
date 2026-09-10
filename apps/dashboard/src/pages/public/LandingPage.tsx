import { Link } from "react-router"
import { Button } from "@repo/ui/button"
import { Card, CardContent } from "@repo/ui/card"
import { ArrowRight, User, Calendar, BookOpen, Layout } from "lucide-react"

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-16 text-center sm:px-6 lg:px-8 lg:pt-32">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="text-clinic-primary block xl:inline">
              Health Clinic
            </span>{" "}
            <span className="block xl:inline">Management System</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
            Streamline your healthcare operations with our comprehensive clinic
            management solution. Manage appointments, patient records, and staff
            efficiently in one place.
          </p>
          <div className="mx-auto mt-10 max-w-md sm:flex sm:justify-center md:mt-12">
            <div className="rounded-md shadow">
              <Link to="/auth/login">
                <Button className="flex w-full items-center justify-center px-8 py-3 text-base font-medium">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Button
                variant="outline"
                className="flex w-full items-center justify-center px-8 py-3 text-base font-medium"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Comprehensive Healthcare Management
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
              Everything you need to manage your clinic efficiently
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <div className="bg-clinic-light rounded-full p-3">
                    <User className="text-clinic-primary h-6 w-6" />
                  </div>
                </div>
                <h3 className="mt-4 text-center text-lg font-medium text-gray-900">
                  User Management
                </h3>
                <p className="mt-2 text-center text-gray-500">
                  Efficiently manage staff, doctors, and patients with
                  role-based access control.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <div className="bg-clinic-light rounded-full p-3">
                    <Calendar className="text-clinic-primary h-6 w-6" />
                  </div>
                </div>
                <h3 className="mt-4 text-center text-lg font-medium text-gray-900">
                  Appointment Scheduling
                </h3>
                <p className="mt-2 text-center text-gray-500">
                  Streamlined appointment booking and management for doctors and
                  patients.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <div className="bg-clinic-light rounded-full p-3">
                    <BookOpen className="text-clinic-primary h-6 w-6" />
                  </div>
                </div>
                <h3 className="mt-4 text-center text-lg font-medium text-gray-900">
                  Medical Records
                </h3>
                <p className="mt-2 text-center text-gray-500">
                  Secure and organized patient medical history and treatment
                  records.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Role-specific section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Tailored for Every Role
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
              Custom dashboards and features for administrators, doctors, and
              patients
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Card className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <div className="bg-clinic-light rounded-full p-3">
                    <Layout className="text-clinic-primary h-6 w-6" />
                  </div>
                </div>
                <h3 className="mt-4 text-center text-lg font-medium text-gray-900">
                  Admin Dashboard
                </h3>
                <p className="mt-2 text-center text-gray-500">
                  Complete oversight of clinic operations, user management, and
                  analytics.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <div className="bg-clinic-light rounded-full p-3">
                    <User className="text-clinic-primary h-6 w-6" />
                  </div>
                </div>
                <h3 className="mt-4 text-center text-lg font-medium text-gray-900">
                  Doctor Portal
                </h3>
                <p className="mt-2 text-center text-gray-500">
                  Streamlined patient management, appointment scheduling, and
                  medical record access.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <div className="bg-clinic-light rounded-full p-3">
                    <User className="text-clinic-primary h-6 w-6" />
                  </div>
                </div>
                <h3 className="mt-4 text-center text-lg font-medium text-gray-900">
                  Patient Portal
                </h3>
                <p className="mt-2 text-center text-gray-500">
                  Easy appointment booking, medical history access, and
                  communication with doctors.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-clinic-primary py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to streamline your clinic operations?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-white opacity-80">
            Join thousands of healthcare providers who trust our platform
          </p>
          <div className="mt-8">
            <Link to="/login">
              <Button variant="secondary" size="lg" className="font-semibold">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Health Clinic Management
              </h3>
              <p className="text-gray-300">
                Streamlining healthcare operations with innovative technology
                solutions.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/login"
                    className="text-gray-300 transition-colors hover:text-white"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-gray-300 transition-colors hover:text-white"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-300 transition-colors hover:text-white"
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Contact</h3>
              <p className="text-gray-300">
                Email: info@healthclinic.com
                <br />
                Phone: (123) 456-7890
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Health Clinic Management. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
