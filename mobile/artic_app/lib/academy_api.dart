import 'dart:convert';

import 'package:http/http.dart' as http;

class AcademyCourse {
  const AcademyCourse({
    required this.id,
    required this.title,
    required this.summary,
    required this.category,
    required this.level,
    required this.durationHours,
  });

  final String id;
  final String title;
  final String summary;
  final String category;
  final String level;
  final int durationHours;

  factory AcademyCourse.fromJson(Map<String, dynamic> json) => AcademyCourse(
        id: json['id'] as String,
        title: json['title'] as String,
        summary: json['summary'] as String,
        category: json['category'] as String,
        level: json['level'] as String,
        durationHours: (json['durationHours'] as num?)?.toInt() ?? 0,
      );
}

class AcademyApi {
  static const _baseUrl = String.fromEnvironment(
    'ARTIC_API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5000/api/v1',
  );

  Future<List<AcademyCourse>> getCourses() async {
    final response = await http
        .get(Uri.parse('$_baseUrl/academy/courses'))
        .timeout(const Duration(seconds: 15));
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Course catalogue is temporarily unavailable.');
    }
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final items = body['data'] as List<dynamic>? ?? const [];
    return items
        .map((item) => AcademyCourse.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
