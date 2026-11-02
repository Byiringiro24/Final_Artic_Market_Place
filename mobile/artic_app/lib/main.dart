import 'package:flutter/material.dart';

import 'academy_api.dart';

void main() => runApp(const ArticApp());

const articNavy = Color(0xFF1A2332);
const articTeal = Color(0xFF18A89A);

class ArticApp extends StatelessWidget {
  const ArticApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'ARTIC Group',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: articTeal),
          scaffoldBackgroundColor: const Color(0xFFF0F4F8),
          useMaterial3: true,
        ),
        home: const PlatformHome(),
      );
}

class PlatformHome extends StatefulWidget {
  const PlatformHome({super.key});

  @override
  State<PlatformHome> createState() => _PlatformHomeState();
}

class _PlatformHomeState extends State<PlatformHome> {
  int _tab = 0;
  final _academyApi = AcademyApi();
  late final Future<List<AcademyCourse>> _courses = _academyApi.getCourses();

  @override
  Widget build(BuildContext context) {
    final pages = [
      _discoverPage(),
      _academyPage(),
      _accountPage(),
    ];
    return Scaffold(
      appBar: AppBar(
        backgroundColor: articNavy,
        foregroundColor: Colors.white,
        title: const Text('ARTIC Group', style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      body: IndexedStack(index: _tab, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (index) => setState(() => _tab = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.explore_outlined), selectedIcon: Icon(Icons.explore), label: 'Discover'),
          NavigationDestination(icon: Icon(Icons.school_outlined), selectedIcon: Icon(Icons.school), label: 'Academy'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Account'),
        ],
      ),
    );
  }

  Widget _discoverPage() => ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: articNavy, borderRadius: BorderRadius.circular(24)),
            child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('One platform. More ways to grow.', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800)),
              SizedBox(height: 10),
              Text('Shop, learn, find services, and connect with ARTIC.', style: TextStyle(color: Colors.white70, height: 1.5)),
            ]),
          ),
          const SizedBox(height: 22),
          const Text('Explore ARTIC', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: articNavy)),
          const SizedBox(height: 12),
          _serviceTile(Icons.storefront_outlined, 'Marketplace', 'Browse products and offers'),
          _serviceTile(Icons.school_outlined, 'ARTIC Academy', 'Courses and practical training', onTap: () => setState(() => _tab = 1)),
          _serviceTile(Icons.handyman_outlined, 'Professional services', 'Discover services and request a booking'),
          _serviceTile(Icons.business_outlined, 'Business directory', 'Find local businesses and professionals'),
          _serviceTile(Icons.event_outlined, 'Events and webinars', 'Explore upcoming learning and business events'),
          _serviceTile(Icons.directions_car_outlined, 'ARTIC VMS', 'Vehicle monitoring system', onTap: () => _showVmsInfo(context)),
        ],
      );

  Widget _academyPage() => FutureBuilder<List<AcademyCourse>>(
        future: _courses,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return _academyMessage('Connect to the ARTIC API to load courses.');
          }
          final courses = snapshot.data ?? [];
          if (courses.isEmpty) return _academyMessage('The course catalogue is being prepared. Check back soon.');
          return ListView(padding: const EdgeInsets.all(20), children: [
            const Text('ARTIC Academy', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: articNavy)),
            const SizedBox(height: 6),
            const Text('Practical learning for individuals and teams.'),
            const SizedBox(height: 18),
            ...courses.map((course) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(course.category.toUpperCase(), style: const TextStyle(color: articTeal, fontSize: 12, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 6),
                      Text(course.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 6),
                      Text(course.summary, maxLines: 3, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 12),
                      Text('${course.level}  ·  ${course.durationHours} hours', style: const TextStyle(color: Colors.black54, fontSize: 12)),
                    ]),
                  ),
                )),
          ]);
        },
      );

  Widget _academyMessage(String message) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.school_outlined, size: 48, color: articTeal),
            const SizedBox(height: 12),
            const Text('ARTIC Academy', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: articNavy)),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center),
          ]),
        ),
      );

  Widget _accountPage() => const Center(
        child: Padding(
          padding: EdgeInsets.all(28),
          child: Text('Sign in and shared account features will be connected to the ARTIC identity API in the next mobile release.', textAlign: TextAlign.center),
        ),
      );

  Widget _serviceTile(IconData icon, String title, String description, {VoidCallback? onTap}) => Card(
        margin: const EdgeInsets.only(bottom: 10),
        child: ListTile(
          onTap: onTap,
          leading: CircleAvatar(backgroundColor: articTeal.withOpacity(0.12), child: Icon(icon, color: articTeal)),
          title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          subtitle: Text(description),
          trailing: const Icon(Icons.chevron_right),
        ),
      );

  void _showVmsInfo(BuildContext context) => showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('ARTIC VMS'),
          content: const Text('Vehicle monitoring is currently provided through the ARTIC VMS web portal. A secure sign-in handoff can be added when its authentication integration is ready.'),
          actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close'))],
        ),
      );
}
