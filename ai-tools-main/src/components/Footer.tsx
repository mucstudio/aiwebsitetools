export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Online Tools Platform. All rights reserved.</p>
          <p className="mt-2">
            Built with Next.js, React, and Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  )
}
