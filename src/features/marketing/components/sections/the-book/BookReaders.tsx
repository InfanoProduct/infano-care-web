'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const READERS = [
  { src: '/experts/1 (1).png', name: 'Zoya', age: 12 },
  { src: '/experts/1 (2).png', name: 'Isha', age: 14 },
  { src: '/experts/1 (3).png', name: 'Ananya', age: 11 },
  { src: '/experts/1 (4).png', name: 'Riya', age: 15 },
  { src: '/experts/1 (5).png', name: 'Sana', age: 13 },
  { src: '/experts/1 (6).png', name: 'Mehak', age: 14 },
];

export function BookReaders() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4"
          >
            Meet Our Readers
          </motion.h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Join thousands of adolescent girls across India who are building confidence and navigating growth with Infano.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {READERS.map((reader, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-100 shadow-sm transition-transform group-hover:scale-105 duration-500">
                <Image 
                  src={reader.src}
                  alt={reader.name}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-slate-900 font-bold text-sm">{reader.name}, {reader.age}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
