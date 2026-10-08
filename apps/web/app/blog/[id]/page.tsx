import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LandingNavbar as Navbar } from '../../landing/components/navbar'
import { LandingFooter as Footer } from '../../landing/components/footer'

const blogs = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200',
    category: 'Healthcare Technology',
    title: 'Digital Transformation in Clinic Management',
    description: 'How modern clinic management systems are streamlining operations, reducing wait times, and improving patient care.',
    content: 'The healthcare industry is rapidly evolving, and modern clinic management systems are at the forefront of this digital transformation. By automating administrative tasks such as appointment scheduling, patient records management, and billing, clinics can significantly reduce wait times and improve the overall patient experience. Furthermore, digital platforms enable better communication between healthcare providers and patients, fostering a more collaborative and personalized approach to care. As technology continues to advance, we can expect to see even more innovative solutions that empower clinics to deliver high-quality, efficient, and accessible healthcare services.',
    date: 'Oct 08, 2026',
    author: 'Dr. John Doe',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=1200',
    category: 'Medical Practice',
    title: 'The Importance of Digital Prescriptions',
    description: 'Why moving from paper to digital prescriptions ensures accuracy, speeds up pharmacy workflows, and saves lives.',
    content: 'The transition from paper-based to digital prescriptions represents a critical advancement in patient safety and healthcare efficiency. Electronic prescribing systems eliminate the risks associated with illegible handwriting, which can lead to medication errors and adverse drug events. By providing clear, standardized, and easily transmittable prescriptions, digital systems ensure that pharmacists dispense the correct medication and dosage. Moreover, e-prescribing streamlines the pharmacy workflow, reducing processing times and enabling faster medication dispensing. This not only improves patient satisfaction but also allows pharmacists to focus more on patient counseling and clinical services. As the adoption of digital prescriptions continues to grow, we can anticipate a significant reduction in medication-related errors and a corresponding improvement in patient outcomes.',
    date: 'Oct 05, 2026',
    author: 'Jane Smith',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200',
    category: 'Finance & Admin',
    title: 'Streamlining Patient Billing',
    description: 'Best practices for medical billing that reduce errors and improve the financial health of your clinic.',
    content: 'Effective medical billing is essential for the financial health and sustainability of any clinic. Streamlining the billing process involves adopting best practices that minimize errors, accelerate reimbursement, and improve the overall patient financial experience. Key strategies include verifying patient insurance eligibility prior to appointments, ensuring accurate coding and documentation, and submitting claims promptly. Additionally, offering transparent and flexible payment options, such as online portals and payment plans, can significantly enhance patient satisfaction and reduce accounts receivable. By implementing these practices and leveraging advanced billing software, clinics can optimize their revenue cycle management, reduce administrative burden, and focus on their primary mission of delivering exceptional patient care.',
    date: 'Oct 01, 2026',
    author: 'Sarah Johnson',
  },
]

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const blog = blogs.find((b) => b.id === params.id)

  if (!blog) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl font-bold">Blog post not found</h1>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Link href="/#blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to blogs
          </Link>
          <article>
            <div className="mb-8 text-center">
              <p className="text-primary font-semibold tracking-wide uppercase mb-2">{blog.category}</p>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">{blog.title}</h1>
              <p className="text-muted-foreground">
                By {blog.author} &bull; {blog.date}
              </p>
            </div>
            <div className="aspect-[21/9] relative mb-12 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="lead text-xl text-muted-foreground mb-8">{blog.description}</p>
              <p>{blog.content}</p>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
}
