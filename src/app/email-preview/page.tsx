'use client';

import React, { useState } from 'react';
import { Mail, Truck, Gift, Laptop, Smartphone, Sparkles, AlertCircle, ExternalLink, Check, Eye } from 'lucide-react';

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<'order-placed' | 'order-shipped' | 'order-delivered'>('order-placed');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [simulateLottie, setSimulateLottie] = useState<boolean>(false);

  const templates = [
    {
      id: 'order-placed' as const,
      name: 'Order Placed (Confirmation)',
      icon: Mail,
      desc: 'Sent immediately after order completion.',
      lottieConcept: {
        title: 'Success / Celebration Animation',
        description: 'A cheerful confetti explosion popping out from an opening gift box.',
        demoUrl: 'https://assets5.lottiefiles.com/packages/lf20_aaymrcqy.json',
        fallbackGif: 'https://i.giphy.com/t372vHspx6U10wZ3H5.gif'
      }
    },
    {
      id: 'order-shipped' as const,
      name: 'Order Shipped (In Transit)',
      icon: Truck,
      desc: 'Sent when the book has been handed to the courier.',
      lottieConcept: {
        title: 'In-Transit / Delivery Animation',
        description: 'A delivery truck/scooter speeding along with moving wheels and speed trails.',
        demoUrl: 'https://assets9.lottiefiles.com/packages/lf20_mkmle58p.json',
        fallbackGif: 'https://i.giphy.com/uuzk82bT7M45QO80Vz.gif'
      }
    },
    {
      id: 'order-delivered' as const,
      name: 'Order Delivered (Arrival)',
      icon: Gift,
      desc: 'Sent when courier marks the shipment as delivered.',
      lottieConcept: {
        title: 'Delivered / Arrival Animation',
        description: 'A present box on a doorstep that pops open revealing a checkmark & shiny stars.',
        demoUrl: 'https://assets2.lottiefiles.com/packages/lf20_y27xtmfl.json',
        fallbackGif: 'https://i.giphy.com/T3V7VwtW85OshZfS3N.gif'
      }
    }
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate)!;

  // Formulate the preview URL
  const previewUrl = `/api/email-preview?template=${selectedTemplate}&enhanced=${simulateLottie}`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-fuchsia-600/10 p-2 rounded-lg border border-fuchsia-500/20">
            <Mail className="h-6 w-6 text-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Infano Care Email System
            </h1>
            <p className="text-xs text-slate-400">Current Design Preview & Lottie Integration Ideas</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setViewportMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewportMode === 'desktop' ? 'bg-fuchsia-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            Desktop
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewportMode === 'mobile' ? 'bg-fuchsia-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Control and Info Panel */}
        <aside className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/50 p-6 flex flex-col gap-6 overflow-y-auto max-h-screen lg:max-h-[calc(100vh-73px)]">
          {/* Template Selection */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Select Book Email Template
            </h3>
            <div className="flex flex-col gap-2">
              {templates.map(t => {
                const Icon = t.icon;
                const isSelected = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-fuchsia-950/40 border-fuchsia-500/50 text-fuchsia-300 shadow-sm'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Template Status Indicator */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-start gap-2.5">
              <Eye className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-slate-200">Viewing: Current Live Design</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  This is the exact layout currently deployed for book orders. It utilizes a violet header theme with a package details list and linear status tracker.
                </p>
              </div>
            </div>
          </div>

          {/* Design Version Control */}
          <div className="border-t border-slate-800/80 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4.5 w-4.5 text-fuchsia-400" />
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Design Version
              </h3>
            </div>
            
            <div className="bg-gradient-to-br from-fuchsia-950/20 to-pink-950/20 border border-fuchsia-900/30 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setSimulateLottie(false)}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                    !simulateLottie
                      ? 'bg-slate-800 text-white border-slate-600 shadow-inner cursor-default'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-300'
                  }`}
                >
                  Current Live Design
                </button>
                <button
                  onClick={() => setSimulateLottie(true)}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                    simulateLottie
                      ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white border-transparent shadow-md cursor-default'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-300'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                  Enhanced Design + Lottie
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-700/30">
                  Lottie Compatibility
                </span>
                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  Emails cannot run raw JSON Lottie files. The enhanced design converts the Lottie animation into a high-quality **APNG** or **GIF** embedded right at the top of the email.
                </p>
              </div>

              {/* Recommended Lottie Animation details */}
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <h5 className="font-semibold text-[10px] text-slate-400 uppercase tracking-wide">
                  Lottie Concept:
                </h5>
                <p className="text-xs text-pink-300 font-semibold mt-1">
                  {currentTemplate.lottieConcept.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {currentTemplate.lottieConcept.description}
                </p>
              </div>
            </div>
          </div>

          {/* Enhancement Ideas list */}
          <div className="border-t border-slate-800/80 pt-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Design Improvement Ideas
            </h3>
            <ul className="text-xs text-slate-400 flex flex-col gap-2.5 list-disc pl-4 leading-relaxed">
              <li>
                <strong className="text-slate-300">Modernized Typography:</strong> Load Inter/Poppins font families from Google Fonts instead of basic browser fallback.
              </li>
              <li>
                <strong className="text-slate-300">Visual Gradient Brand Header:</strong> Upgrade the top border accent with an Infano brand color gradient (violet to deep pink).
              </li>
              <li>
                <strong className="text-slate-300">Pill Badges for Status:</strong> Transition the current order tracker to a gorgeous status badge design with modern SVGs.
              </li>
              <li>
                <strong className="text-slate-300">Card-Style Invoice details:</strong> Use structured, rounded container cards with subtle shadow borders to make it look premium.
              </li>
            </ul>
          </div>
        </aside>

        {/* Right Iframe Live Preview Container */}
        <main className="flex-1 bg-slate-900 p-6 md:p-8 flex items-center justify-center overflow-y-auto">
          <div
            className={`transition-all duration-300 relative flex flex-col h-full items-center ${
              viewportMode === 'desktop' ? 'w-full max-w-[680px]' : 'w-full max-w-[395px]'
            }`}
          >
            {/* Header info bar */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
              <span>Viewport: {viewportMode === 'desktop' ? 'Desktop (600px width limit)' : 'Mobile (375px width limit)'}</span>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-fuchsia-400 font-medium transition-colors"
              >
                Open in new tab <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Frame containing the email render */}
            <div
              className={`w-full bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-950 flex flex-col flex-1 ${
                viewportMode === 'mobile' ? 'max-h-[700px]' : 'min-h-[600px] lg:h-[750px]'
              }`}
            >


              {/* Email Content Frame */}
              <iframe
                key={`${selectedTemplate}-${simulateLottie}`}
                src={previewUrl}
                className="w-full flex-1 border-0 bg-[#F5F0F6]"
                title="Email Template Render"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
