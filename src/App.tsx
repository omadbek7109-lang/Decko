import { type ReactNode, useEffect } from 'react';
import { t } from './i18n/uz';
import { ROUTES, navigate, usePath } from './lib/router';
import { useStore } from './lib/store';
import { CreateRoomScreen, FriendsScreen, JoinRoomScreen } from './screens/FriendsScreens';
import { LobbyScreen } from './screens/LobbyScreen';
import { PlaySetupScreen } from './screens/PlaySetupScreen';
import { HistoryScreen, ProfileScreen, RankingsScreen } from './screens/ProfileScreens';
import { RulesScreen, SettingsScreen } from './screens/SettingsScreens';
import { SplashScreen } from './screens/SplashScreen';
import { GameTableScreen } from './screens/table/GameTableScreen';
import { sessionStore } from './state/session';
import { Button } from './ui/components/Button';
import { LogoMark } from './ui/components/Logo';

const SCREENS: Record<string, () => ReactNode> = {
  [ROUTES.lobby]: () => <LobbyScreen />,
  [ROUTES.play]: () => <PlaySetupScreen />,
  [ROUTES.game]: () => <GameTableScreen />,
  [ROUTES.friends]: () => <FriendsScreen />,
  [ROUTES.createRoom]: () => <CreateRoomScreen />,
  [ROUTES.joinRoom]: () => <JoinRoomScreen />,
  [ROUTES.profile]: () => <ProfileScreen />,
  [ROUTES.history]: () => <HistoryScreen />,
  [ROUTES.rankings]: () => <RankingsScreen />,
  [ROUTES.settings]: () => <SettingsScreen />,
  [ROUTES.rules]: () => <RulesScreen />,
};

function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <LogoMark size={48} />
      <p className="text-[16px] font-semibold">Sahifa topilmadi</p>
      <Button onClick={() => navigate(ROUTES.lobby, { replace: true })}>{t.game.toLobby}</Button>
    </div>
  );
}

export function App() {
  const path = usePath();
  const ready = useStore(sessionStore, (s) => s.ready);
  const signedIn = useStore(sessionStore, (s) => s.user !== null);

  // Guard: signed-out users see the entry screen; signed-in users skip it.
  useEffect(() => {
    if (!ready) return;
    if (!signedIn && path !== ROUTES.splash) navigate(ROUTES.splash, { replace: true });
    if (signedIn && path === ROUTES.splash) navigate(ROUTES.lobby, { replace: true });
  }, [ready, signedIn, path]);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center" aria-busy="true">
        <LogoMark size={56} />
      </div>
    );
  }
  if (!signedIn || path === ROUTES.splash) return <SplashScreen />;
  const render = SCREENS[path];
  return render ? render() : <NotFound />;
}
