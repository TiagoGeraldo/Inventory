import { createDrawerNavigator } from '@react-navigation/drawer';
import { CustomDrawer } from '../components/navigation/CustomDrawer';

const Drawer = createDrawerNavigator();

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: true,
      }}
    >
      {/* Drawer screens will be added here */}
    </Drawer.Navigator>
  );
} 