import {
    Code2,
    Trophy,
    Users,
    MessageSquare,
    CheckCircle2,
    Globe,
    BookOpen,
    Award,
    Target,
    FileCode2,
    Laptop,
    ArrowRight,
  } from "lucide-react";
  import HeroSection from "@/app/(public)/(home)/components/HeroSection";
  import Link from "next/link";
  import { Button } from "@/components/ui/button";
  
  export const metadata = {
    title: "DIU ACM Community | Competitive Programming Excellence",
    description:
      "Join DIU ACM to excel in competitive programming through structured learning paths, regular contests, and expert mentorship. Home of ICPC aspirants at Daffodil International University.",
    keywords: [
      "competitive programming",
      "DIU ACM",
      "programming contests",
      "ICPC",
      "algorithm training",
      "coding competition",
      "Daffodil International University",
    ],
  };
  
  const rules = {
    contests: [
      "No external website usage during contests except the platform",
      "Hard copy templates are allowed with specified limits",
      "Code sharing must be enabled on Vjudge contests",
      "Any form of plagiarism results in permanent ban",
    ],
    lab: [
      "Lab access requires regular ACM programmer status",
      "Maintain respectful behavior towards seniors and teachers",
      "Avoid disturbing others during practice sessions",
      "Keep the lab clean and organized",
    ],
    online: [
      "Forum usage prohibited during online contests",
      "Basic resource websites (GFG, CPAlgo) are allowed",
      "Maintain code submission history",
      "Report technical issues immediately",
    ],
  };
  
  const programs = [
    {
      title: "Green Sheet Program",
      description:
        "Master programming basics with our curated problem set covering fundamental concepts. Solve 60% to qualify for Blue Sheet.",
      icon: FileCode2,
      color: "from-green-500 to-emerald-500",
      link: "/blogs/green-sheet",
    },
    {
      title: "Blue Sheet Advanced",
      description:
        "1000+ carefully selected problems for advanced programmers. Regular updates based on top solver performance.",
      icon: Award,
      color: "from-blue-500 to-indigo-500",
      link: "/blogs/blue-sheet",
    },
    {
      title: "ACM Advanced Camp",
      description:
        "Intensive training program for TOPC top performers with mentoring from seniors and alumni.",
      icon: Target,
      color: "from-purple-500 to-pink-500",
      link: "/blogs/advanced-camp",
    },
  ];
  
  const competitions = [
    {
      title: "Take-Off Programming Contest",
      description:
        "Semester-based contest series for beginners with mock, preliminary, and main rounds.",
      phases: ["Mock Round", "Preliminary", "Main Contest"],
      eligibility:
        "1st semester students enrolled in Programming & Problem Solving",
    },
    {
      title: "Unlock The Algorithm",
      description:
        "Advanced algorithmic contest focusing on data structures and algorithms.",
      phases: ["Mock Round", "Preliminary", "Final Round"],
      eligibility: "Students enrolled in Algorithms course",
    },
    {
      title: "DIU ACM Cup",
      description:
        "Tournament-style competition to crown the best programmer each semester.",
      phases: ["Group Stage", "Knockouts", "Finals"],
      eligibility: "Top 32 regular programmers",
    },
  ];
  
  const features = [
    {
      title: "Structured Learning",
      description:
        "Follow our carefully designed learning tracks to build skills progressively from basics to advanced topics.",
      icon: BookOpen,
    },
    {
      title: "Regular Contests",
      description:
        "Weekly contests help you apply what you've learned and track your improvement over time.",
      icon: Trophy,
    },
    {
      title: "Expert Mentorship",
      description:
        "Get guidance from experienced seniors and alumni who have excelled in competitive programming.",
      icon: Users,
    },
  ];
  
  const steps = [
    {
      title: "Master the Green Sheet",
      description:
        "Complete our curated set of beginner-level problems. Aim for 60% completion to become eligible for the Blue Sheet.",
      icon: BookOpen,
      color: "text-green-500",
    },
    {
      title: "Join Regular Contests",
      description:
        "Participate in our weekly onsite DIU Individual Contest every Friday and track your progress through our Individual Contest Tracker.",
      icon: Code2,
      color: "text-blue-500",
    },
    {
      title: "Visit ACM Lab",
      description:
        "Come to KT-310 to meet the community and get help with your competitive programming journey.",
      icon: Users,
      color: "text-purple-500",
    },
  ];
  
  const stats = [
    {
      value: "100+",
      label: "Weekly Problems",
      icon: Code2,
      color: "from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600",
    },
    {
      value: "20+",
      label: "Annual Contests",
      icon: Trophy,
      color: "from-cyan-500 to-cyan-700 dark:from-cyan-400 dark:to-cyan-600",
    },
    {
      value: "50+",
      label: "ICPC Participants",
      icon: Award,
      color:
        "from-violet-500 to-violet-700 dark:from-violet-400 dark:to-violet-600",
    },
    {
      value: "200+",
      label: "Active Members",
      icon: Users,
      color:
        "from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600",
    },
  ];
  
  export default function Homepage() {
    return (
      <>
        {/* Hero Section */}
        <HeroSection />
  
        {/* How It Works Section */}
        <section className="py-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                How DIU ACM Works
              </h2>
              <div className="mx-auto w-20 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 rounded-full mb-4"></div>
            </div>
  
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700 relative"
                >
                  <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Programs Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Learning Programs
              </h2>
              <div className="mx-auto w-20 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 rounded-full mb-4"></div>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                Structured paths to excellence in competitive programming
              </p>
            </div>
  
            <div className="grid md:grid-cols-3 gap-8">
              {programs.map((program, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                    <program.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {program.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    {program.description}
                  </p>
                  <Button
                    asChild
                    variant="link"
                    className="p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <Link href={program.link}>
                      View details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Stats Section */}
        <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden bg-white dark:bg-slate-800 shadow-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
                >
                  <div
                    className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-20`}
                  ></div>
                  <div className="flex flex-col items-center text-center z-10 relative">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
                    >
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Competitions Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Our Competitions
              </h2>
              <div className="mx-auto w-20 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 rounded-full mb-4"></div>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                Regular contests to test and improve your skills
              </p>
            </div>
  
            <div className="grid lg:grid-cols-3 gap-8">
              {competitions.map((competition, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                    {competition.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    {competition.description}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Phases
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {competition.phases.map((phase, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                          >
                            {phase}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Eligibility
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {competition.eligibility}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Features Section */}
        <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                What You&apos;ll Get
              </h2>
              <div className="mx-auto w-20 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 rounded-full mb-4"></div>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                Empowering your competitive programming journey with comprehensive
                resources
              </p>
            </div>
  
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                    <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Rules Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Rules &amp; Guidelines
              </h2>
              <div className="mx-auto w-20 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 rounded-full mb-4"></div>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                Essential rules to maintain the integrity of our competitive
                programming community
              </p>
            </div>
  
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Contest Rules
                  </h3>
                </div>
                <ul className="space-y-4">
                  {rules.contests.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {rule}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
  
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Laptop className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Lab Rules
                  </h3>
                </div>
                <ul className="space-y-4">
                  {rules.lab.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {rule}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
  
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Online Contest Rules
                  </h3>
                </div>
                <ul className="space-y-4">
                  {rules.online.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {rule}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
  
        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10" />
  
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-10 shadow-xl border border-slate-200 dark:border-slate-700">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Join DIU ACM Community
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  We don&apos;t have a traditional membership system. Your passion for
                  competitive programming and regular participation makes you a
                  part of our community.
                </p>
              </div>
  
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl transition-all dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600 font-medium"
                >
                  <a
                    href="https://t.me/+X94KLytY-Kk5NzU9"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Join Telegram
                  </a>
                </Button>
  
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 shadow-md hover:shadow-xl transition-all dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-400 dark:hover:text-blue-300 dark:border-slate-700 dark:hover:border-slate-600 font-medium"
                >
                  <Link href="/contact">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
  