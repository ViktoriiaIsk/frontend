export default function EcoSection() {
  return (
    <section className="py-12 bg-green-50 border-t border-green-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-4">
          <span className="text-5xl">🌱</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-4">
          Why it matters for the planet
        </h2>
        <p className="text-lg text-green-800 mb-4">
          Every second-hand book you buy or share helps reduce waste, saves resources, and gives stories a new life. BookSwap is about sustainable reading and conscious consumption.
        </p>
        <ul className="text-green-900 text-base mb-4 list-inside list-disc inline-block text-left">
          <li>♻️ Less waste — fewer books end up in landfill</li>
          <li>🌳 Saves trees and water</li>
          <li>💚 Supports a circular, eco-friendly economy</li>
          <li>📚 Makes reading affordable and accessible</li>
        </ul>
        <div className="mt-4 text-green-700 font-semibold">
          Join the movement — choose second-hand, save the planet!
        </div>
      </div>
    </section>
  );
} 