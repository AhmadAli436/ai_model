'use client';

export default function AuthLeftCard() {
  return (
    <div className="hidden flex-1 items-center bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8 text-white lg:flex lg:p-12">
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* Main Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
            AI Intelligence, at a Glance
          </h1>
          <p className="text-base leading-relaxed text-purple-100 lg:text-lg">
            A centralized dashboard for all your AI chat interactions. Real-time
            conversation analytics, quality scores, and actionable insights — so
            you can scale customer interactions with confidence.
          </p>
        </div>

        {/* Feature Cards - Reduced to 2 */}
        <div className="space-y-4 pt-4">
          <div className="rounded-lg border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold">
                  Real-time Analytics
                </h3>
                <p className="text-sm text-purple-100">
                  Track conversation quality, response times, and user
                  satisfaction metrics in real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold">Smart Insights</h3>
                <p className="text-sm text-purple-100">
                  Uncover weak spots and optimize your AI chat operations with
                  intelligent recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
