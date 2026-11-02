# ARTIC mobile app starter

This Flutter starter is the first native-app slice for iOS and Android. It introduces the ARTIC service hub, Academy catalogue screen, and a shared-API client. Marketplace checkout, login, bookings, push notifications, and offline course progress are later implementation phases.

## Create native platform runners

Flutter/Dart were not installed in the implementation environment, so the Android/iOS runner folders and generated lockfile are not included yet. Install Flutter, then from `mobile/artic_app` run:

```bash
flutter create --platforms=android,ios .
flutter pub get
flutter run --dart-define=ARTIC_API_BASE_URL=http://10.0.2.2:5000/api/v1
```

Use the development machine’s LAN address for a physical Android device; use `http://localhost:5000/api/v1` for an iOS simulator. Production builds should pass the HTTPS API URL through `ARTIC_API_BASE_URL`.

The app consumes the same versioned Node API as the web app. It does not connect directly to PostgreSQL or ARTIC VMS.
