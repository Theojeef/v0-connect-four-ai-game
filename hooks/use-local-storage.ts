"use client"

import { useState, useEffect } from "react"

type StorageType = "session" | "local"

export function useStorage<T>(
  key: string,
  initialValue: T,
  storageType: StorageType = "local",
): [T, (value: T | ((val: T) => T)) => void] {
  // Get storage object based on type
  const storageObject = storageType === "local" ? localStorage : sessionStorage

  // Function to get from storage
  const getStoredValue = (): T => {
    try {
      const item = storageObject.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading storage key "${key}":`, error)
      return initialValue
    }
  }

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(getStoredValue)

  // Return a wrapped version of useState's setter function
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to storage
      storageObject.setItem(key, JSON.stringify(valueToStore))

      // Dispatch a custom event so other components can subscribe to changes
      window.dispatchEvent(new CustomEvent("storage-update", { detail: { key, value: valueToStore } }))
    } catch (error) {
      console.error(`Error setting storage key "${key}":`, error)
    }
  }

  // Listen for changes to this key in other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === storageObject) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue)
        } catch (error) {
          console.error(`Error parsing storage value for key "${key}":`, error)
        }
      }
    }

    // Listen for the custom event for same-tab updates
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value)
      }
    }

    // Subscribe to events
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("storage-update", handleCustomStorageChange as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("storage-update", handleCustomStorageChange as EventListener)
    }
  }, [key, storageObject, initialValue])

  return [storedValue, setValue]
}

// Shorthand for localStorage
export function useLocalStorage<T>(key: string, initialValue: T) {
  return useStorage<T>(key, initialValue, "local")
}

// Shorthand for sessionStorage
export function useSessionStorage<T>(key: string, initialValue: T) {
  return useStorage<T>(key, initialValue, "session")
}
