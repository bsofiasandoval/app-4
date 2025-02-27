'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import WeatherWidget from '@/components/WeatherWidget';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface City {
  id: string;
  name: string;
}

const STORAGE_KEY = 'weather-dashboard-cities';

export default function Home() {
  const [cities, setCities] = useState<City[]>([]);
  const [cityName, setCityName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // Load cities from localStorage
  useEffect(() => {
    const savedCities = localStorage.getItem(STORAGE_KEY);
    if (savedCities) setCities(JSON.parse(savedCities));
  }, []);

  // Save cities to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
  }, [cities]);

  const addCity = () => {
    const trimmedName = cityName.trim();
    if (!trimmedName) {
      toast.error("Please enter a city name");
      return;
    }

    setCities(prev => [
      ...prev,
      { id: `manual-${Date.now()}`, name: trimmedName }
    ]);
    toast.success(`Added ${trimmedName} to your dashboard`);
    setCityName('');
    setIsDialogOpen(false);
  };

  const removeCity = (cityId: string) => {
    const updatedCities = cities.filter(city => city.id !== cityId);
    const removedCity = cities.find(city => city.id === cityId);
    setCities(updatedCities);
    setConfirmRemoveId(null);
    if (removedCity) toast.success(`Removed ${removedCity.name} from your dashboard`);
  };

  const handleCityNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCityName(e.target.value);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Weather Dashboard</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Add City
          </Button>
        </header>

        {cities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">No cities added yet</h2>
            <p className="text-muted-foreground mb-4">Add a city to see its weather information</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Your First City
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map(city => (
              <div key={city.id} className="relative group">
                <button
                  onClick={() => setConfirmRemoveId(city.id)}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <WeatherWidget city={city.name} />
              </div>
            ))}
          </div>
        )}

        {/* Add City Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add City</DialogTitle>
              <DialogDescription>
                Enter a city name to add it to your dashboard
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="City name"
              value={cityName}
              onChange={handleCityNameChange}
              onKeyDown={e => e.key === 'Enter' && addCity()}
            />
            <DialogFooter>
              <Button onClick={addCity} className="w-full">
                Add City
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Confirmation Dialog */}
        <Dialog open={!!confirmRemoveId} onOpenChange={open => !open && setConfirmRemoveId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Removal</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove this city from your dashboard?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmRemoveId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmRemoveId && removeCity(confirmRemoveId)}
              >
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}