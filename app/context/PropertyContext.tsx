"use client";
import React, { createContext, useContext, useState } from "react";

const PropertyContext = createContext<any>(null);

export const PropertyProvider = ({ children }: { children: React.ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null); // New state

  const openModal = (property = null) => {
    setEditingProperty(property); // If property is passed, it's Edit Mode
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingProperty(null);
    setIsModalOpen(false);
  };

  return (
    <PropertyContext.Provider value={{ isModalOpen, editingProperty, openModal, closeModal }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => useContext(PropertyContext);