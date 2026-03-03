import React, {useState, useEffect, ReactNode} from 'react';
import {Alert, AlertComponent, AlertOptions} from './Alert';

interface AlertState extends AlertOptions {
  id: string;
  visible: boolean;
}

interface AlertProviderProps {
  children: ReactNode;
}

/**
 * AlertProvider
 *
 * Alert.show()를 사용하기 위해 앱 최상위에 추가해야 하는 Provider
 *
 * @example
 * ```tsx
 * // App.tsx
 * import {AlertProvider} from '@/components/ui/AlertProvider';
 *
 * function App() {
 *   return (
 *     <AlertProvider>
 *       <YourApp />
 *     </AlertProvider>
 *   );
 * }
 * ```
 */
export function AlertProvider({children}: AlertProviderProps) {
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  useEffect(() => {
    Alert.setListener(
      (options: AlertOptions & {id: string}) => {
        setAlerts(prev => [
          ...prev,
          {
            ...options,
            visible: true,
            buttons: options.buttons || [{text: '확인', onPress: () => {}}],
          },
        ]);
      },
      (id: string) => {
        setAlerts(prev =>
          prev.map(alert =>
            alert.id === id ? {...alert, visible: false} : alert,
          ),
        );

        // Animation 완료 후 제거
        setTimeout(() => {
          setAlerts(prev => prev.filter(alert => alert.id !== id));
        }, 300);
      },
    );
  }, []);

  const handleClose = (id: string) => {
    Alert.hide(id);
  };

  return (
    <>
      {children}
      {alerts.map(alert => (
        <AlertComponent
          key={alert.id}
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          buttons={alert.buttons!}
          onClose={() => handleClose(alert.id)}
          cancelable={alert.cancelable}
        />
      ))}
    </>
  );
}
