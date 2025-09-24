import { MainLayout } from '@/components';

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="col-span-full">
        <div className="py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Contact
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
            Let's get in touch! Feel free to reach out for collaborations or
            just to say hello.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Send me a message
              </h2>
              <form className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Your message here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Get in touch
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-sm">
                        📧
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        Email
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        your.email@example.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-sm">
                        📱
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        Phone
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        +1 (555) 123-4567
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-sm">
                        📍
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        Location
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your City, Country
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links Placeholder */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Follow me
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Social media links coming soon...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
