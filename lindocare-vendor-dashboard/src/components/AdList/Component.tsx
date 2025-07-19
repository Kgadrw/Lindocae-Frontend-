import React, { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface Ad {
  _id: string;
  title: string;
  content: string;
  buttonLabel: string;
  image: string | string[];
}

interface AdListProps {
  tableView?: boolean;
}

const AdList: React.FC<AdListProps> = ({ tableView }) => {
  // ... (rest of the code from AdList.tsx)
};

export default AdList; 