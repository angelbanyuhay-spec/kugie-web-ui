import React from 'react';
import { MapPin, Phone, Mail, Facebook } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="bg-white py-24 px-4 sm:px-8 scroll-mt-24" aria-labelledby="landing-contact-heading">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <h3 id="landing-contact-heading" className="text-5xl font-black mb-8">
            GET IN TOUCH
          </h3>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-[#ebcc8f] rounded-full">
                <MapPin />
              </div>
              <div>
                <p className="font-bold">Location</p>
                <p className="text-gray-600">1030 Miguelin Street, Sampaloc, Manila</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-[#ebcc8f] rounded-full">
                <Phone />
              </div>
              <div>
                <p className="font-bold">Contact Number</p>
                <p className="text-gray-600">
                  <a href="tel:+639257381274" className="text-gray-600 hover:text-[#f49d03] transition">
                    +63 925 738 1274
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-[#ebcc8f] rounded-full">
                <Mail />
              </div>
              <div>
                <p className="font-bold">Email</p>
                <p className="text-gray-600">
                  <a href="mailto:kugiebites@gmail.com" className="text-gray-600 hover:text-[#f49d03] transition">
                    kugiebites@gmail.com
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-[#ebcc8f] rounded-full">
                <Facebook />
              </div>
              <div>
                <p className="font-bold">Facebook</p>
                <p className="text-gray-600">
                  <a
                    href="https://facebook.com/kugiebites"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#f49d03] transition"
                  >
                    facebook.com/kugiebites
                  </a>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
