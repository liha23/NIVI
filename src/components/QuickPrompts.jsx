import React from 'react'
import { 
  Code, 
  Lightbulb, 
  BookOpen, 
  Sparkles, 
  MessageSquare,
  Zap,
  Brush,
  Calculator
} from 'lucide-react'

const QuickPrompts = ({ onSelectPrompt, isVisible = true }) => {
  const prompts = [
    {
      icon: Code,
      title: "Code Helper",
      prompt: "Help me write clean, efficient code",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Lightbulb,
      title: "Creative Ideas",
      prompt: "Give me creative ideas for my project",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: BookOpen,
      title: "Learn Something",
      prompt: "Explain a complex topic in simple terms",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Brush,
      title: "Content Writing",
      prompt: "Help me write engaging content",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Calculator,
      title: "Problem Solving",
      prompt: "Help me solve a problem step by step",
      color: "from-red-500 to-rose-500"
    },
    {
      icon: Sparkles,
      title: "AI Capabilities",
      prompt: "What can you help me with today?",
      color: "from-indigo-500 to-violet-500"
    }
  ]

  if (!isVisible) return null

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-400 via-accent-purple to-accent-cyan bg-clip-text text-transparent mb-3">
          How can I assist you today?
        </h2>
        <p className="text-neutral-400 text-lg">
          Choose a quick action or type your own message below ✨
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt.prompt)}
            className="group relative p-5 bg-gradient-to-br from-neutral-900/60 via-neutral-800/50 to-neutral-900/60 backdrop-blur-xl hover:from-neutral-800/70 hover:via-neutral-800/60 hover:to-neutral-800/70 border border-neutral-800/50 hover:border-neutral-700/70 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-glow text-left overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${prompt.color} opacity-0 group-hover:opacity-15 transition-opacity duration-300`} />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            
            {/* Premium Icon with glow */}
            <div className="relative mb-4">
              <div className={`absolute -inset-1 bg-gradient-to-br ${prompt.color} rounded-xl blur-md opacity-0 group-hover:opacity-75 transition-opacity duration-300`} />
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${prompt.color} flex items-center justify-center shadow-medium group-hover:shadow-glow transition-shadow duration-300`}>
                <prompt.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Content */}
            <div className="relative">
              <h3 className="font-semibold text-neutral-200 mb-1.5 group-hover:text-white transition-colors text-base">
                {prompt.title}
              </h3>
              <p className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors leading-relaxed">
                {prompt.prompt}
              </p>
            </div>
            
            {/* Arrow indicator with bounce */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
              <Zap className="w-4 h-4 text-brand-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickPrompts
