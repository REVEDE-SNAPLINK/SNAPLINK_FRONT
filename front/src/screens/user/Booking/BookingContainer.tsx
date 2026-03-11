import BookingView from '@/screens/user/Booking/BookingView.tsx';
import { safeLogEvent } from '@/utils/analytics.ts';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { schedulesQueryKeys } from '@/queries/keys.ts';
import { getAvailableBookingTimes } from '@/api/schedules.ts';
import { useForm } from 'react-hook-form';
import { useAvailableBookingDaysQuery, useAvailableBookingTimesQuery } from '@/queries/schedules.ts';
import { useShootingsQuery, useShootingOptionsQuery } from '@/queries/shootings.ts';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useRegionsQuery } from '@/queries/meta.ts';
import { usePhotographerRegionsConceptsTagsQuery } from '@/queries/photographers.ts';

type BookingRouteProp = RouteProp<MainStackParamList, 'Booking'>;

interface BookingFormInputs {
  date: string;
  time: string;
  regionId: number;
  productId: number;
}

export default function BookingContainer() {
  const route = useRoute<BookingRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { photographerId } = route.params;

  const { watch, setValue, handleSubmit, formState: { isValid } } = useForm<BookingFormInputs>({
    mode: 'onChange',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: '',
      regionId: 0,
      productId: 0,
    },
  });
  const selectedDate = watch('date');
  const selectedTime = watch('time');
  const selectedRegionId = watch('regionId');
  const selectedProductIdField = watch('productId');
  const isInitialDateSet = useRef(false);

  // Track booking form abandonment
  const formStartTimeRef = useRef<number | null>(null);
  const formCompletedRef = useRef(false);

  // State for option quantities
  const [optionQuantities, setOptionQuantities] = useState<Record<number, number>>({});
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setToday(new Date());

    // 1) 앱이 켜져있는 동안 주기적으로 체크(가벼움)
    const id = setInterval(tick, 60_000); // 1분마다
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // booking_intent는 PhotographerDetails에서 예약 버튼 클릭 시 이미 발송됨 (중복 방지)

    // Record form start time
    formStartTimeRef.current = Date.now();

    // Cleanup: Log abandonment if form not completed
    return () => {
      if (!formCompletedRef.current && formStartTimeRef.current) {
        const timeSpentSeconds = (Date.now() - formStartTimeRef.current) / 1000;

        safeLogEvent('booking_form_abandoned', {
          photographer_id: photographerId,
          step: 'product_selection',
          time_spent_seconds: Math.round(timeSpentSeconds),
          had_date: !!selectedDate,
          had_time: !!selectedTime,
          had_product: !!selectedProductIdField,
          had_region: !!selectedRegionId,
        });
      }
    };
  }, [photographerId, selectedDate, selectedProductIdField, selectedRegionId, selectedTime]);


  // Fetch shooting products
  const {
    data: shootingProducts,
    isFetching: isFetchingProducts,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useShootingsQuery(photographerId);

  // Fetch shooting options for selected product
  const {
    data: shootingOptions,
    isFetching: isFetchingOptions,
    isError: isOptionsError,
    refetch: refetchOptions,
  } = useShootingOptionsQuery(
    selectedProductIdField,
    !!selectedProductIdField,
  );

  const {
    data: regions
  } = useRegionsQuery();

  // Fetch photographer's regions
  const { data: photographerRegionsData } = usePhotographerRegionsConceptsTagsQuery(photographerId);

  // Get available region IDs from photographer's regions
  const availableRegionIds = useMemo(() => {
    if (!photographerRegionsData?.regions) return [];
    return photographerRegionsData.regions.map((r) => r.id);
  }, [photographerRegionsData]);

  // Calculate booking range (today ~ 3 months from today)
  const maxBookingDate = useMemo(() => {
    const date = new Date(today);
    date.setMonth(date.getMonth() + 3);
    return date;
  }, [today]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // Helper function to get previous/next month
  const getPrevMonth = (year: number, month: number) => {
    if (month === 1) return { year: year - 1, month: 12 };
    return { year, month: month - 1 };
  };

  const getNextMonth = (year: number, month: number) => {
    if (month === 12) return { year: year + 1, month: 1 };
    return { year, month: month + 1 };
  };

  const prevMonth = getPrevMonth(currentMonth.year, currentMonth.month);
  const nextMonth = getNextMonth(currentMonth.year, currentMonth.month);

  // Check if a month is within the allowed range (today ~ 3 months from today)
  const isMonthInRange = (year: number, month: number) => {
    const targetMonth = new Date(year, month - 1, 1);
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxMonth = new Date(maxBookingDate.getFullYear(), maxBookingDate.getMonth(), 1);
    return targetMonth >= minMonth && targetMonth <= maxMonth;
  };

  // Fetch available days for current, previous, and next month
  const { data: currentMonthDays } = useAvailableBookingDaysQuery(
    {
      photographerId,
      year: currentMonth.year,
      month: currentMonth.month,
    },
    isMonthInRange(currentMonth.year, currentMonth.month),
  );

  const { data: prevMonthDays } = useAvailableBookingDaysQuery(
    {
      photographerId,
      year: prevMonth.year,
      month: prevMonth.month,
    },
    isMonthInRange(prevMonth.year, prevMonth.month),
  );

  const { data: nextMonthDays } = useAvailableBookingDaysQuery(
    {
      photographerId,
      year: nextMonth.year,
      month: nextMonth.month,
    },
    isMonthInRange(nextMonth.year, nextMonth.month),
  );

  // Fetch available times for selected date
  const {
    data: availableTimes,
    isFetching: isFetchingTimes,
    isError: isTimesError,
    refetch: refetchTimes,
  } = useAvailableBookingTimesQuery(
    {
      photographerId,
      date: selectedDate,
    },
    !!selectedDate, // Only fetch when date is selected
  );
  const queryClient = useQueryClient();

  const prefetchTimes = useCallback(
    (date: string) => {
      if (!photographerId || !date) return;
      queryClient.prefetchQuery({
        queryKey: schedulesQueryKeys.availableTimes({ photographerId, date }),
        queryFn: () => getAvailableBookingTimes({ photographerId, date }),
        staleTime: 1000 * 60 * 2,
      });
    },
    [queryClient, photographerId]
  );

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handleChangeDate = (date: string) => {
    setValue('date', date);
    setValue('time', '');

    // Prefetch times for this date
    prefetchTimes(date);

    // Prefetch times for next available date (best-effort)
    if (availableDates && availableDates.length > 0) {
      const idx = availableDates.indexOf(date);
      const next = idx >= 0 ? availableDates[idx + 1] : availableDates[0];
      if (next) prefetchTimes(next);
    }

    // Update currentMonth when date changes
    const [year, month] = date.split('-').map(Number);
    setCurrentMonth(prev => {
      if (prev.year === year && prev.month === month) return prev;
      return { year, month };
    });
  };

  const handleMonthChange = (year: number, month: number) => {
    // Prevent navigating to months outside the allowed range
    const targetMonth = new Date(year, month - 1, 1);
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxMonth = new Date(maxBookingDate.getFullYear(), maxBookingDate.getMonth(), 1);

    // Only allow months within the range
    if (targetMonth < minMonth || targetMonth > maxMonth) {
      return;
    }

    setCurrentMonth({ year, month });
  };

  // Transform available times to time slots
  const timeSlots = useMemo(() => {
    if (!availableTimes) return [];

    const now = new Date();

    // Local "today" string (YYYY-MM-DD)
    const yyyy = now.getFullYear().toString();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const isToday = selectedDate === todayStr;

    return availableTimes.filter((slot) => {
      // 1) If booking for today, disallow past (or same-minute) times
      if (isToday) {
        const [hour, minute] = slot.startTime.split(':').map(Number);
        const slotTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hour,
          minute,
          0,
          0,
        );
        return slotTime.getTime() > now.getTime();
      }

      return true;
    });
  }, [availableTimes, selectedDate]);

  const handleSelectTime = useCallback(
    (time: string) => {
      // Defensive: ignore invalid selections even if UI allows the tap
      const slot = timeSlots.find((s) => s.startTime === time);
      if (!slot) return;

      setValue('time', time);
    },
    [setValue, timeSlots],
  );

  const handleToggleRegion = (id: number) => {
    // Toggle: if already selected, deselect. Otherwise, select this one.
    const newRegionId = selectedRegionId === id ? 0 : id;
    setValue('regionId', newRegionId);
  }

  const handlePressShootingProduct = (productId: number) => {
    setValue('productId', productId);
    // Reset option quantities when product changes
    setOptionQuantities({});

    // Best-effort prefetch options happens naturally via query;
    // keepPreviousData prevents UI flash.
  };

  const handleOptionQuantityChange = (optionId: number, quantity: number) => {
    setOptionQuantities((prev) => ({
      ...prev,
      [optionId]: quantity,
    }));
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = 0;

    // Add base price from selected product
    if (selectedProductIdField && shootingProducts) {
      const selectedProduct = shootingProducts.find((p) => p.id === selectedProductIdField);
      if (selectedProduct) {
        total += selectedProduct.basePrice;
      }
    }

    // Add option prices (price × quantity)
    if (shootingOptions) {
      shootingOptions.forEach((option) => {
        const quantity = optionQuantities[option.id] || 0;
        total += option.price * quantity;
      });
    }

    return total;
  }, [selectedProductIdField, shootingProducts, shootingOptions, optionQuantities]);

  const onSubmit = (data: BookingFormInputs) => {
    // Mark form as completed to prevent abandonment event
    formCompletedRef.current = true;

    // Collect selected options with quantities (only options with quantity > 0)
    const options = Object.entries(optionQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([optionId, count]) => ({
        id: Number(optionId),
        count,
      }));

    // Get selected region's city name
    const selectedRegion = regions?.find((r) => r.id === data.regionId);
    const regionCity = selectedRegion?.city || '';

    // booking_request_submitted는 BookingRequestContainer에서 실제 API 호출 시 발송 (중복 방지)

    // Navigate to BookingRequest with form data
    navigation.navigate('BookingRequest', {
      photographerId,
      productId: data.productId,
      options,
      shootingDate: data.date,
      startTime: data.time, // HH:mm format
      region: regionCity,
    });
  };

  // Transform available days to date strings (YYYY-MM-DD)
  const availableDates = useMemo(() => {
    const dates: string[] = [];
    const todayStr = today.toISOString().split('T')[0];
    const maxDateStr = maxBookingDate.toISOString().split('T')[0];

    // Helper to format date string
    const formatDate = (year: number, month: number, day: number) => {
      const yyyy = year.toString();
      const mm = month.toString().padStart(2, '0');
      const dd = day.toString().padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    // Helper to check if date is within allowed range
    const isDateInRange = (dateStr: string) => {
      return dateStr >= todayStr && dateStr <= maxDateStr;
    };

    // Add available dates from previous month
    if (prevMonthDays) {
      prevMonthDays
        .filter((d) => d.available)
        .forEach((d) => {
          const dateStr = formatDate(prevMonth.year, prevMonth.month, d.day);
          if (isDateInRange(dateStr)) {
            dates.push(dateStr);
          }
        });
    }

    // Add available dates from current month
    if (currentMonthDays) {
      currentMonthDays
        .filter((d) => d.available)
        .forEach((d) => {
          const dateStr = formatDate(currentMonth.year, currentMonth.month, d.day);
          if (isDateInRange(dateStr)) {
            dates.push(dateStr);
          }
        });
    }

    // Add available dates from next month
    if (nextMonthDays) {
      nextMonthDays
        .filter((d) => d.available)
        .forEach((d) => {
          const dateStr = formatDate(nextMonth.year, nextMonth.month, d.day);
          if (isDateInRange(dateStr)) {
            dates.push(dateStr);
          }
        });
    }

    return dates;
  }, [currentMonthDays, prevMonthDays, nextMonthDays, currentMonth, prevMonth, nextMonth, today, maxBookingDate]);

  // Set initial date to first available date if current date is not available
  useEffect(() => {
    if (availableDates && availableDates.length > 0 && !isInitialDateSet.current) {
      const formattedInitialDate = new Date().toISOString().split('T')[0];
      if (!availableDates.includes(formattedInitialDate)) {
        setValue('date', availableDates[0]);
      } else {
        setValue('date', formattedInitialDate);
      }
      isInitialDateSet.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableDates]);

  // Check if form is valid: date and time must be selected
  const isFormValid = isValid && !!selectedDate && !!selectedTime;

  // Format min and max dates for calendar
  const minDateStr = today.toISOString().split('T')[0];
  const maxDateStr = maxBookingDate.toISOString().split('T')[0];

  return (
    <BookingView
      onPressBack={handlePressBack}
      onChangeDate={handleChangeDate}
      onMonthChange={handleMonthChange}
      initialDate={selectedDate}
      currentDate={selectedDate}
      availableDates={availableDates}
      minDate={minDateStr}
      maxDate={maxDateStr}
      timeSlots={timeSlots}
      selectedTime={selectedTime}
      onSelectTime={handleSelectTime}
      availbleRegions={regions ? regions?.filter((v) => availableRegionIds.includes(v.id)) : []}
      selectedRegionId={selectedRegionId}
      onToggleRegion={handleToggleRegion}
      shootingProducts={shootingProducts ?? []}
      isFetchingProducts={isFetchingProducts}
      isProductsError={isProductsError}
      onRetryProducts={refetchProducts}
      shootingOptions={shootingOptions ?? []}
      isFetchingOptions={isFetchingOptions}
      isOptionsError={isOptionsError}
      onRetryOptions={refetchOptions}
      optionalQuantities={optionQuantities}
      onOptionalQuantityChange={handleOptionQuantityChange}
      selectedProductId={selectedProductIdField}
      onPressShootingProduct={handlePressShootingProduct}
      isFetchingTimes={isFetchingTimes}
      isTimesError={isTimesError}
      onRetryTimes={refetchTimes}
      totalPrice={totalPrice}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitDisabled={!isFormValid}
      navigation={navigation}
    />
  );
}
