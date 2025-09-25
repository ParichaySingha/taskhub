import React, { useState } from 'react'
import type { Route } from '../../+types/root';
import { Button } from '~/components/ui/button';
import { Link } from 'react-router';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { 
  CheckCircle, 
  Star, 
  Users, 
  Calendar, 
  BarChart3, 
  FileText, 
  Zap,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Task Hub - Manage Your Tasks Effortlessly" },
    { name: "description", content: "Manage your tasks, track progress and collaborate with your team effortlessly. Join thousands of teams who are already experiencing the benefits of Task Hub." },
  ];
}

const home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Task Hub</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#product" className="text-gray-600 hover:text-gray-900 transition-colors">Product</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#resources" className="text-gray-600 hover:text-gray-900 transition-colors">Resources</a>
              <a href="#company" className="text-gray-600 hover:text-gray-900 transition-colors">Company</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/sign-in">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Login
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                  Sign Up
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <a href="#product" className="text-gray-600 hover:text-gray-900">Product</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
                <a href="#resources" className="text-gray-600 hover:text-gray-900">Resources</a>
                <a href="#company" className="text-gray-600 hover:text-gray-900">Company</a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <Link to="/sign-in">
                    <Button variant="ghost" className="w-full justify-start">Login</Button>
                  </Link>
                  <Link to="/sign-up">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Decorative dots */}
            <div className="flex justify-center space-x-2 mb-8">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              See Why You'll Love Working With{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Task Hub
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Manage your tasks, track progress and collaborate with your team effortlessly.
            </p>

            {/* Task Cards Preview */}
            <div className="relative mb-16">
              <div className="flex justify-center items-center space-x-4">
                <Card className="w-64 h-32 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">D</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Design System Mockup</span>
                    </div>
                    <p className="text-xs text-gray-500">Due: Dec 15, 2025</p>
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-2 h-2 text-green-600" />
                      </div>
                      <span className="text-xs text-gray-600">In Progress</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>

                <Card className="w-64 h-32 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">L</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Lightweight Read-Only</span>
                    </div>
                    <p className="text-xs text-gray-500">Due: Dec 18, 2025</p>
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      </div>
                      <span className="text-xs text-gray-600">Planning</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>

                <Card className="w-64 h-32 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">API Integration</span>
                    </div>
                    <p className="text-xs text-gray-500">Due: Dec 20, 2025</p>
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-2 h-2 text-green-600" />
                      </div>
                      <span className="text-xs text-gray-600">Completed</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>

                <Card className="w-64 h-32 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">T</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Team Conversation</span>
                    </div>
                    <p className="text-xs text-gray-500">Due: Dec 22, 2025</p>
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-2 h-2 text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-600">In Discussion</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-8 py-3">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-3">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="product" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              From Planning to Completion, We've Got You!
            </h2>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="text-lg font-semibold text-gray-900 ml-2">4.8/5</span>
              </div>
              <div className="flex space-x-4">
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Innovative Solutions for Modern Conversations
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                From high-speed communication to seamless file sharing, Task Hub offers everything you need to keep your team connected and productive.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Improved Task Organization</h4>
                    <p className="text-gray-600">Keep your projects organized with intuitive task management and clear project structures.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">User-Friendly Interface</h4>
                    <p className="text-gray-600">Designed with simplicity in mind, making it easy for anyone to get started quickly.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Increased Productivity</h4>
                    <p className="text-gray-600">Streamline your workflow and boost team productivity with powerful collaboration tools.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">My Tasks</span>
                      <span className="text-xs text-gray-500">12</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">My Projects</span>
                      <span className="text-xs text-gray-500">5</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Team</span>
                      <span className="text-xs text-gray-500">8</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Notifications</span>
                      <span className="text-xs text-gray-500">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Unmatched Features, Unbeatable Performance
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Task Hub is built to deliver a smooth, responsive, and reliable experience, ensuring your team stays productive and focused.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Customizable Dashboard</h3>
                <p className="text-gray-600">
                  Tailor your workspace to your needs with flexible dashboard layouts and personalized widgets.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">File Sharing & Integration</h3>
                <p className="text-gray-600">
                  Seamlessly share files and integrate with your favorite tools for a unified workflow.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Tracking</h3>
                <p className="text-gray-600">
                  Monitor project progress with detailed analytics and real-time updates on task completion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Experience the Joy of Effortless Collaboration
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of teams who are already experiencing the benefits of Task Hub.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <Link to="/sign-up">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-bold">Task Hub</span>
              </div>
              <p className="text-gray-400 mb-6">
                The ultimate task management solution for modern teams. Collaborate, organize, and achieve more together.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm ml-2">4.8/5</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Overview</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Parichay Singha. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default home
