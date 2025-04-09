'use client';

import { BackgroundLines } from '@/components';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

const Loading = React.memo(() => {
  return (
    <BackgroundLines>
      <div className="flex flex-col justify-center items-center min-h-screen w-full bg-white relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-48 h-48 mb-8"
        >
          <Image
            src="/assets/images/logo.png"
            alt="Mel Dreams Logo"
            layout="fill"
            objectFit="contain"
            className="animate-pulse"
          />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-2xl font-semibold text-center mt-4 text-gray-800"
        >
          Loading your artistic world...
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-2 text-center text-gray-600"
        >
          Please wait while we prepare your canvas
        </motion.p>
      </div>
    </BackgroundLines>
  );
});

Loading.displayName = 'Loading';

export default Loading;
