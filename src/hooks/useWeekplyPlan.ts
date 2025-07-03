import { useEffect, useState } from 'react';

interface WeeklyPlanData {
  dailyCalories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const useWeeklyPlan = (patientId: string) => {
  const [plan, setPlan] = useState<WeeklyPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyPlan = async () => {
      try {
        const dailyRes = await fetch(`http://TU_BACKEND/weeklyplan/daily/${patientId}`);
        if (dailyRes.ok) {
          const data = await dailyRes.json();
          setPlan({
            dailyCalories: data.dailyCalories,
            protein: data.protein,
            fat: data.fat,
            carbs: data.carbs,
          });
          return;
        }

        if (dailyRes.status === 404) {
          const latestRes = await fetch(`http://TU_BACKEND/weeklyplan/latest/${patientId}`);
          if (latestRes.ok) {
            const data = await latestRes.json();
            setPlan({
              dailyCalories: data.dailyCalories,
              protein: data.protein,
              fat: data.fat,
              carbs: data.carbs,
            });
          }
        }
      } catch (err) {
        console.error('❌ Error en useWeeklyPlan:', err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) fetchWeeklyPlan();
  }, [patientId]);

  return { plan, loading };
};
