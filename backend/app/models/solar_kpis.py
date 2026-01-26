"""
Default KPI Definitions for the SOLAR Framework

This module provides pre-configured KPIs for each dimension of the SOLAR framework.
These KPIs are based on the "Building Anchored on the Blessing" Mental Models workshop.

SOLAR Dimensions:
- S: Spiritual Vitality
- O: Organisational Governance
- L: Love & Care
- A: Advancement
- R: Resources
"""

SOLAR_KPI_DEFINITIONS = {
    # =========================================================================
    # S - SPIRITUAL VITALITY KPIs
    # =========================================================================
    "S": {
        "name": "Spiritual Vitality",
        "description": "The spiritual health and vibrancy of the church community",
        "icon": "🙏",
        "color": "#8B5CF6",  # Purple
        "sub_dimensions": {
            "transformational_worship": {
                "name": "Transformational Worship",
                "description": "Every service is a divine encounter where God's presence is tangible",
                "kpis": [
                    {
                        "code": "S-TW-001",
                        "name": "Worship Attendance Rate",
                        "description": "Percentage of registered members attending Sunday services",
                        "measurement_type": "percentage",
                        "target_value": 75,
                        "target_unit": "%",
                        "excellent_threshold": 80,
                        "good_threshold": 65,
                        "fair_threshold": 50,
                        "collection_frequency": "weekly",
                        "weight": 1.5
                    },
                    {
                        "code": "S-TW-002",
                        "name": "Worship Team Spiritual Preparation",
                        "description": "Worship teams are spiritually prepared, not just musically skilled",
                        "measurement_type": "scale",
                        "target_value": 8,
                        "target_unit": "1-10 scale",
                        "excellent_threshold": 9,
                        "good_threshold": 7,
                        "fair_threshold": 5,
                        "collection_frequency": "monthly",
                        "weight": 1.0
                    },
                    {
                        "code": "S-TW-003",
                        "name": "Altar Response Rate",
                        "description": "Percentage of services with meaningful altar responses",
                        "measurement_type": "percentage",
                        "target_value": 80,
                        "target_unit": "%",
                        "excellent_threshold": 85,
                        "good_threshold": 70,
                        "fair_threshold": 50,
                        "collection_frequency": "monthly",
                        "weight": 1.0
                    },
                    {
                        "code": "S-TW-004",
                        "name": "Online Engagement Quality",
                        "description": "Both in-person and online worshippers experience God's touch",
                        "measurement_type": "percentage",
                        "target_value": 70,
                        "target_unit": "% engagement rate",
                        "excellent_threshold": 75,
                        "good_threshold": 60,
                        "fair_threshold": 40,
                        "collection_frequency": "weekly",
                        "weight": 0.8
                    }
                ]
            },
            "prayer_culture": {
                "name": "Prayer Culture",
                "description": "A vibrant culture of prayer throughout the church",
                "kpis": [
                    {
                        "code": "S-PC-001",
                        "name": "Prayer Meeting Attendance",
                        "description": "Average attendance at dedicated prayer meetings",
                        "measurement_type": "percentage",
                        "target_value": 30,
                        "target_unit": "% of membership",
                        "excellent_threshold": 40,
                        "good_threshold": 25,
                        "fair_threshold": 15,
                        "collection_frequency": "weekly",
                        "weight": 1.0
                    },
                    {
                        "code": "S-PC-002",
                        "name": "Prayer Requests Submitted",
                        "description": "Number of prayer requests submitted per month",
                        "measurement_type": "count",
                        "target_value": 50,
                        "target_unit": "requests/month",
                        "excellent_threshold": 75,
                        "good_threshold": 40,
                        "fair_threshold": 20,
                        "collection_frequency": "monthly",
                        "weight": 0.5
                    },
                    {
                        "code": "S-PC-003",
                        "name": "Answered Prayer Testimonies",
                        "description": "Testimonies of answered prayers shared",
                        "measurement_type": "count",
                        "target_value": 10,
                        "target_unit": "testimonies/month",
                        "excellent_threshold": 15,
                        "good_threshold": 8,
                        "fair_threshold": 3,
                        "collection_frequency": "monthly",
                        "weight": 1.0
                    }
                ]
            },
            "word_and_teaching": {
                "name": "Word & Teaching",
                "description": "Messages are anointed, biblical, and lead to life transformation",
                "kpis": [
                    {
                        "code": "S-WT-001",
                        "name": "Sermon Application Rate",
                        "description": "Members applying sermon teachings in daily life",
                        "measurement_type": "percentage",
                        "target_value": 60,
                        "target_unit": "%",
                        "excellent_threshold": 75,
                        "good_threshold": 55,
                        "fair_threshold": 40,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    },
                    {
                        "code": "S-WT-002",
                        "name": "Bible Study Participation",
                        "description": "Percentage of members in regular Bible study",
                        "measurement_type": "percentage",
                        "target_value": 40,
                        "target_unit": "%",
                        "excellent_threshold": 50,
                        "good_threshold": 35,
                        "fair_threshold": 20,
                        "collection_frequency": "monthly",
                        "weight": 1.0
                    }
                ]
            }
        }
    },

    # =========================================================================
    # O - ORGANISATIONAL GOVERNANCE KPIs
    # =========================================================================
    "O": {
        "name": "Organisational Governance",
        "description": "The structural health and leadership effectiveness of the church",
        "icon": "🏛️",
        "color": "#3B82F6",  # Blue
        "sub_dimensions": {
            "organisational_culture": {
                "name": "Organisational Culture",
                "description": "Shared behaviours and values rooted in Christ-like character",
                "kpis": [
                    {
                        "code": "O-OC-001",
                        "name": "Culture Health Index",
                        "description": "Everyone feels valued, heard, and empowered to contribute",
                        "measurement_type": "scale",
                        "target_value": 8,
                        "target_unit": "1-10 scale",
                        "excellent_threshold": 9,
                        "good_threshold": 7,
                        "fair_threshold": 5,
                        "collection_frequency": "quarterly",
                        "weight": 1.5
                    },
                    {
                        "code": "O-OC-002",
                        "name": "Staff/Volunteer Retention Rate",
                        "description": "High morale, strong retention, and passionate commitment",
                        "measurement_type": "percentage",
                        "target_value": 85,
                        "target_unit": "%",
                        "excellent_threshold": 90,
                        "good_threshold": 80,
                        "fair_threshold": 65,
                        "collection_frequency": "annually",
                        "weight": 1.0
                    },
                    {
                        "code": "O-OC-003",
                        "name": "Conflict Resolution Effectiveness",
                        "description": "Healthy conflict resolution and grace-filled relationships",
                        "measurement_type": "percentage",
                        "target_value": 90,
                        "target_unit": "% resolved positively",
                        "excellent_threshold": 95,
                        "good_threshold": 85,
                        "fair_threshold": 70,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    }
                ]
            },
            "leadership_development": {
                "name": "Leadership Development",
                "description": "Leaders model servant leadership and transparency",
                "kpis": [
                    {
                        "code": "O-LD-001",
                        "name": "Leaders in Training Pipeline",
                        "description": "Number of emerging leaders in development programs",
                        "measurement_type": "count",
                        "target_value": 20,
                        "target_unit": "leaders",
                        "excellent_threshold": 30,
                        "good_threshold": 15,
                        "fair_threshold": 8,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    },
                    {
                        "code": "O-LD-002",
                        "name": "Leadership Training Completion Rate",
                        "description": "Percentage completing leadership development",
                        "measurement_type": "percentage",
                        "target_value": 80,
                        "target_unit": "%",
                        "excellent_threshold": 90,
                        "good_threshold": 75,
                        "fair_threshold": 60,
                        "collection_frequency": "annually",
                        "weight": 1.0
                    }
                ]
            },
            "governance_structures": {
                "name": "Governance Structures",
                "description": "Clear structures for accountability and decision-making",
                "kpis": [
                    {
                        "code": "O-GS-001",
                        "name": "Board Meeting Effectiveness",
                        "description": "Regular, productive governance meetings",
                        "measurement_type": "percentage",
                        "target_value": 100,
                        "target_unit": "% meetings held",
                        "excellent_threshold": 100,
                        "good_threshold": 90,
                        "fair_threshold": 75,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    },
                    {
                        "code": "O-GS-002",
                        "name": "Policy Compliance Rate",
                        "description": "Adherence to established policies and procedures",
                        "measurement_type": "percentage",
                        "target_value": 95,
                        "target_unit": "%",
                        "excellent_threshold": 98,
                        "good_threshold": 90,
                        "fair_threshold": 80,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    }
                ]
            }
        }
    },

    # =========================================================================
    # L - LOVE & CARE KPIs
    # =========================================================================
    "L": {
        "name": "Love & Care",
        "description": "The relational health and care systems of the church",
        "icon": "❤️",
        "color": "#EF4444",  # Red
        "sub_dimensions": {
            "family_groups": {
                "name": "Family Group Ecosystem",
                "description": "Church away from church - primary relational system for members",
                "kpis": [
                    {
                        "code": "L-FG-001",
                        "name": "Family Group Participation Rate",
                        "description": "Majority of members actively participate and feel connected",
                        "measurement_type": "percentage",
                        "target_value": 70,
                        "target_unit": "% of membership",
                        "excellent_threshold": 80,
                        "good_threshold": 60,
                        "fair_threshold": 40,
                        "collection_frequency": "monthly",
                        "weight": 1.5
                    },
                    {
                        "code": "L-FG-002",
                        "name": "Family Group Multiplication Rate",
                        "description": "Groups multiplying when they mature",
                        "measurement_type": "percentage",
                        "target_value": 20,
                        "target_unit": "% groups multiplied/year",
                        "excellent_threshold": 30,
                        "good_threshold": 15,
                        "fair_threshold": 5,
                        "collection_frequency": "annually",
                        "weight": 1.0
                    },
                    {
                        "code": "L-FG-003",
                        "name": "Community Impact Through Groups",
                        "description": "Groups are missional - reaching neighbors and networks",
                        "measurement_type": "count",
                        "target_value": 3,
                        "target_unit": "outreach activities/group/quarter",
                        "excellent_threshold": 5,
                        "good_threshold": 2,
                        "fair_threshold": 1,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    }
                ]
            },
            "member_care": {
                "name": "Member Care",
                "description": "Members support each other in crises and celebrate victories",
                "kpis": [
                    {
                        "code": "L-MC-001",
                        "name": "Hospital/Home Visit Rate",
                        "description": "Pastoral visits to members in need",
                        "measurement_type": "percentage",
                        "target_value": 95,
                        "target_unit": "% of reported cases visited",
                        "excellent_threshold": 100,
                        "good_threshold": 90,
                        "fair_threshold": 75,
                        "collection_frequency": "monthly",
                        "weight": 1.0
                    },
                    {
                        "code": "L-MC-002",
                        "name": "Member Satisfaction Score",
                        "description": "Members feel cared for by the church",
                        "measurement_type": "scale",
                        "target_value": 8,
                        "target_unit": "1-10 scale",
                        "excellent_threshold": 9,
                        "good_threshold": 7,
                        "fair_threshold": 5,
                        "collection_frequency": "quarterly",
                        "weight": 1.5
                    }
                ]
            },
            "new_believers_integration": {
                "name": "New Believers Integration",
                "description": "New believers are quickly integrated and discipled",
                "kpis": [
                    {
                        "code": "L-NB-001",
                        "name": "New Believer Follow-up Rate",
                        "description": "Percentage of new believers contacted within 48 hours",
                        "measurement_type": "percentage",
                        "target_value": 100,
                        "target_unit": "%",
                        "excellent_threshold": 100,
                        "good_threshold": 90,
                        "fair_threshold": 75,
                        "collection_frequency": "weekly",
                        "weight": 1.0
                    },
                    {
                        "code": "L-NB-002",
                        "name": "New Believer Retention (6 months)",
                        "description": "New believers still active after 6 months",
                        "measurement_type": "percentage",
                        "target_value": 70,
                        "target_unit": "%",
                        "excellent_threshold": 80,
                        "good_threshold": 60,
                        "fair_threshold": 40,
                        "collection_frequency": "quarterly",
                        "weight": 1.5
                    },
                    {
                        "code": "L-NB-003",
                        "name": "Baptism Completion Rate",
                        "description": "New believers completing baptism",
                        "measurement_type": "percentage",
                        "target_value": 85,
                        "target_unit": "%",
                        "excellent_threshold": 95,
                        "good_threshold": 80,
                        "fair_threshold": 60,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    }
                ]
            },
            "discipleship": {
                "name": "Discipleship",
                "description": "Systematic growth in spiritual maturity",
                "kpis": [
                    {
                        "code": "L-DS-001",
                        "name": "Discipleship Course Enrollment",
                        "description": "Members enrolled in discipleship programs",
                        "measurement_type": "percentage",
                        "target_value": 40,
                        "target_unit": "% of membership",
                        "excellent_threshold": 50,
                        "good_threshold": 30,
                        "fair_threshold": 15,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    },
                    {
                        "code": "L-DS-002",
                        "name": "Discipleship Completion Rate",
                        "description": "Members completing discipleship pathway",
                        "measurement_type": "percentage",
                        "target_value": 75,
                        "target_unit": "%",
                        "excellent_threshold": 85,
                        "good_threshold": 65,
                        "fair_threshold": 50,
                        "collection_frequency": "annually",
                        "weight": 1.0
                    }
                ]
            }
        }
    },

    # =========================================================================
    # A - ADVANCEMENT KPIs
    # =========================================================================
    "A": {
        "name": "Advancement",
        "description": "The outward movement of mission and community impact",
        "icon": "🚀",
        "color": "#10B981",  # Green
        "sub_dimensions": {
            "outreach_engagements": {
                "name": "Outreach Engagements",
                "description": "Active engagement in sharing the gospel",
                "kpis": [
                    {
                        "code": "A-OE-001",
                        "name": "Evangelism Events",
                        "description": "Number of organized outreach events",
                        "measurement_type": "count",
                        "target_value": 4,
                        "target_unit": "events/quarter",
                        "excellent_threshold": 6,
                        "good_threshold": 3,
                        "fair_threshold": 1,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    },
                    {
                        "code": "A-OE-002",
                        "name": "First-Time Visitors",
                        "description": "New visitors attending services",
                        "measurement_type": "count",
                        "target_value": 20,
                        "target_unit": "visitors/month",
                        "excellent_threshold": 30,
                        "good_threshold": 15,
                        "fair_threshold": 5,
                        "collection_frequency": "monthly",
                        "weight": 1.0
                    },
                    {
                        "code": "A-OE-003",
                        "name": "Visitor Retention Rate",
                        "description": "First-time visitors who return",
                        "measurement_type": "percentage",
                        "target_value": 40,
                        "target_unit": "%",
                        "excellent_threshold": 50,
                        "good_threshold": 35,
                        "fair_threshold": 20,
                        "collection_frequency": "monthly",
                        "weight": 1.5
                    }
                ]
            },
            "local_community_impact": {
                "name": "Local Community Impact",
                "description": "Transformational presence in the local community",
                "kpis": [
                    {
                        "code": "A-LC-001",
                        "name": "Community Projects",
                        "description": "Active community service projects",
                        "measurement_type": "count",
                        "target_value": 5,
                        "target_unit": "projects/year",
                        "excellent_threshold": 8,
                        "good_threshold": 4,
                        "fair_threshold": 2,
                        "collection_frequency": "annually",
                        "weight": 1.0
                    },
                    {
                        "code": "A-LC-002",
                        "name": "Community Beneficiaries",
                        "description": "People served through community programs",
                        "measurement_type": "count",
                        "target_value": 500,
                        "target_unit": "people/year",
                        "excellent_threshold": 1000,
                        "good_threshold": 300,
                        "fair_threshold": 100,
                        "collection_frequency": "annually",
                        "weight": 1.0
                    }
                ]
            },
            "digital_mission": {
                "name": "Digital Mission & Media Influence",
                "description": "Digital platforms advance the kingdom locally, nationally & globally",
                "kpis": [
                    {
                        "code": "A-DM-001",
                        "name": "Social Media Reach",
                        "description": "Total social media followers/subscribers",
                        "measurement_type": "count",
                        "target_value": 5000,
                        "target_unit": "followers",
                        "excellent_threshold": 10000,
                        "good_threshold": 3000,
                        "fair_threshold": 1000,
                        "collection_frequency": "monthly",
                        "weight": 0.8
                    },
                    {
                        "code": "A-DM-002",
                        "name": "Online Engagement Rate",
                        "description": "Active engagement with digital content",
                        "measurement_type": "percentage",
                        "target_value": 5,
                        "target_unit": "% engagement rate",
                        "excellent_threshold": 8,
                        "good_threshold": 4,
                        "fair_threshold": 2,
                        "collection_frequency": "monthly",
                        "weight": 1.0
                    },
                    {
                        "code": "A-DM-003",
                        "name": "Online Discipleship Conversions",
                        "description": "People starting discipleship journey through digital",
                        "measurement_type": "count",
                        "target_value": 10,
                        "target_unit": "conversions/month",
                        "excellent_threshold": 20,
                        "good_threshold": 7,
                        "fair_threshold": 3,
                        "collection_frequency": "monthly",
                        "weight": 1.5
                    },
                    {
                        "code": "A-DM-004",
                        "name": "Content Publishing Consistency",
                        "description": "Consistent, high-quality content schedule",
                        "measurement_type": "percentage",
                        "target_value": 90,
                        "target_unit": "% of scheduled posts published",
                        "excellent_threshold": 95,
                        "good_threshold": 85,
                        "fair_threshold": 70,
                        "collection_frequency": "monthly",
                        "weight": 0.8
                    }
                ]
            },
            "compassion_humanitarian": {
                "name": "Compassion & Humanitarian Response",
                "description": "Meeting physical and material needs in Jesus' name",
                "kpis": [
                    {
                        "code": "A-CH-001",
                        "name": "Benevolence Fund Utilization",
                        "description": "Percentage of benevolence budget used for those in need",
                        "measurement_type": "percentage",
                        "target_value": 80,
                        "target_unit": "%",
                        "excellent_threshold": 90,
                        "good_threshold": 70,
                        "fair_threshold": 50,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    },
                    {
                        "code": "A-CH-002",
                        "name": "Families Assisted",
                        "description": "Families receiving material assistance",
                        "measurement_type": "count",
                        "target_value": 30,
                        "target_unit": "families/quarter",
                        "excellent_threshold": 50,
                        "good_threshold": 20,
                        "fair_threshold": 10,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    }
                ]
            }
        }
    },

    # =========================================================================
    # R - RESOURCES KPIs
    # =========================================================================
    "R": {
        "name": "Resources",
        "description": "The capacity to fuel vision and mission through financial and human resources",
        "icon": "💰",
        "color": "#F59E0B",  # Amber
        "sub_dimensions": {
            "financial_health": {
                "name": "Financial Health & Stewardship",
                "description": "Sound financial management and biblical stewardship",
                "kpis": [
                    {
                        "code": "R-FH-001",
                        "name": "Budget Achievement Rate",
                        "description": "Actual income vs budgeted income",
                        "measurement_type": "percentage",
                        "target_value": 100,
                        "target_unit": "%",
                        "excellent_threshold": 110,
                        "good_threshold": 95,
                        "fair_threshold": 80,
                        "collection_frequency": "monthly",
                        "weight": 1.5
                    },
                    {
                        "code": "R-FH-002",
                        "name": "Tithing Member Percentage",
                        "description": "Percentage of members who tithe regularly",
                        "measurement_type": "percentage",
                        "target_value": 50,
                        "target_unit": "%",
                        "excellent_threshold": 65,
                        "good_threshold": 40,
                        "fair_threshold": 25,
                        "collection_frequency": "monthly",
                        "weight": 1.5
                    },
                    {
                        "code": "R-FH-003",
                        "name": "Operating Reserve Months",
                        "description": "Months of operating expenses in reserve",
                        "measurement_type": "count",
                        "target_value": 3,
                        "target_unit": "months",
                        "excellent_threshold": 6,
                        "good_threshold": 3,
                        "fair_threshold": 1,
                        "collection_frequency": "monthly",
                        "weight": 1.0
                    },
                    {
                        "code": "R-FH-004",
                        "name": "Expense to Income Ratio",
                        "description": "Total expenses as percentage of income",
                        "measurement_type": "percentage",
                        "target_value": 85,
                        "target_unit": "%",
                        "excellent_threshold": 75,
                        "good_threshold": 90,
                        "fair_threshold": 100,
                        "collection_frequency": "monthly",
                        "weight": 1.0
                    }
                ]
            },
            "human_resources": {
                "name": "Human Resources & Personal Capacity",
                "description": "Staff and leadership capacity",
                "kpis": [
                    {
                        "code": "R-HR-001",
                        "name": "Staff Satisfaction Score",
                        "description": "Staff and key volunteer satisfaction",
                        "measurement_type": "scale",
                        "target_value": 8,
                        "target_unit": "1-10 scale",
                        "excellent_threshold": 9,
                        "good_threshold": 7,
                        "fair_threshold": 5,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    },
                    {
                        "code": "R-HR-002",
                        "name": "Key Position Fill Rate",
                        "description": "Percentage of key roles filled",
                        "measurement_type": "percentage",
                        "target_value": 95,
                        "target_unit": "%",
                        "excellent_threshold": 100,
                        "good_threshold": 90,
                        "fair_threshold": 75,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    }
                ]
            },
            "volunteer_systems": {
                "name": "Volunteer Systems & Workforce Mobilisation",
                "description": "Effective volunteer engagement and management",
                "kpis": [
                    {
                        "code": "R-VS-001",
                        "name": "Volunteer Participation Rate",
                        "description": "Percentage of members serving as volunteers",
                        "measurement_type": "percentage",
                        "target_value": 30,
                        "target_unit": "%",
                        "excellent_threshold": 40,
                        "good_threshold": 25,
                        "fair_threshold": 15,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    },
                    {
                        "code": "R-VS-002",
                        "name": "Volunteer Retention Rate",
                        "description": "Volunteers continuing service year over year",
                        "measurement_type": "percentage",
                        "target_value": 80,
                        "target_unit": "%",
                        "excellent_threshold": 90,
                        "good_threshold": 75,
                        "fair_threshold": 60,
                        "collection_frequency": "annually",
                        "weight": 1.0
                    }
                ]
            },
            "investment_strategy": {
                "name": "Investment Strategy & Asset Growth",
                "description": "Beyond donations - assets finance the significant work of the church",
                "kpis": [
                    {
                        "code": "R-IS-001",
                        "name": "Investment Portfolio Value",
                        "description": "Total value of church investments",
                        "measurement_type": "currency",
                        "target_value": 500000,
                        "target_unit": "currency",
                        "excellent_threshold": 1000000,
                        "good_threshold": 250000,
                        "fair_threshold": 50000,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    },
                    {
                        "code": "R-IS-002",
                        "name": "Investment Returns",
                        "description": "Annual return on investments",
                        "measurement_type": "percentage",
                        "target_value": 8,
                        "target_unit": "% annual return",
                        "excellent_threshold": 12,
                        "good_threshold": 6,
                        "fair_threshold": 3,
                        "collection_frequency": "annually",
                        "weight": 1.0
                    },
                    {
                        "code": "R-IS-003",
                        "name": "Diversified Income Streams",
                        "description": "Number of income streams beyond tithes/offerings",
                        "measurement_type": "count",
                        "target_value": 3,
                        "target_unit": "streams",
                        "excellent_threshold": 5,
                        "good_threshold": 2,
                        "fair_threshold": 1,
                        "collection_frequency": "annually",
                        "weight": 0.8
                    }
                ]
            },
            "infrastructure": {
                "name": "Infrastructure, Facilities & Technology",
                "description": "Physical and technological resources",
                "kpis": [
                    {
                        "code": "R-IF-001",
                        "name": "Facility Utilization Rate",
                        "description": "Usage of church facilities",
                        "measurement_type": "percentage",
                        "target_value": 60,
                        "target_unit": "% utilization",
                        "excellent_threshold": 75,
                        "good_threshold": 50,
                        "fair_threshold": 30,
                        "collection_frequency": "monthly",
                        "weight": 0.8
                    },
                    {
                        "code": "R-IF-002",
                        "name": "Technology Systems Uptime",
                        "description": "Reliability of church technology systems",
                        "measurement_type": "percentage",
                        "target_value": 99,
                        "target_unit": "%",
                        "excellent_threshold": 99.9,
                        "good_threshold": 98,
                        "fair_threshold": 95,
                        "collection_frequency": "monthly",
                        "weight": 0.5
                    }
                ]
            },
            "donor_development": {
                "name": "Donor Development & Cultivation",
                "description": "Growing the giving base and partnership",
                "kpis": [
                    {
                        "code": "R-DD-001",
                        "name": "New Givers",
                        "description": "New first-time givers per quarter",
                        "measurement_type": "count",
                        "target_value": 15,
                        "target_unit": "new givers/quarter",
                        "excellent_threshold": 25,
                        "good_threshold": 10,
                        "fair_threshold": 5,
                        "collection_frequency": "quarterly",
                        "weight": 1.0
                    },
                    {
                        "code": "R-DD-002",
                        "name": "Giving Unit Retention",
                        "description": "Giving households continuing year over year",
                        "measurement_type": "percentage",
                        "target_value": 85,
                        "target_unit": "%",
                        "excellent_threshold": 92,
                        "good_threshold": 80,
                        "fair_threshold": 65,
                        "collection_frequency": "annually",
                        "weight": 1.0
                    },
                    {
                        "code": "R-DD-003",
                        "name": "Average Gift Growth",
                        "description": "Year over year growth in average gift amount",
                        "measurement_type": "percentage",
                        "target_value": 5,
                        "target_unit": "% growth",
                        "excellent_threshold": 10,
                        "good_threshold": 3,
                        "fair_threshold": 0,
                        "collection_frequency": "annually",
                        "weight": 0.8
                    }
                ]
            }
        }
    }
}


def get_all_kpi_definitions():
    """
    Flatten all KPI definitions for database seeding.
    Returns a list of dictionaries ready for KPIDefinition model.
    """
    all_kpis = []
    
    for dimension_key, dimension_data in SOLAR_KPI_DEFINITIONS.items():
        for sub_dim_key, sub_dim_data in dimension_data.get("sub_dimensions", {}).items():
            for kpi in sub_dim_data.get("kpis", []):
                all_kpis.append({
                    "dimension": dimension_key,
                    "sub_dimension": sub_dim_key,
                    "name": kpi["name"],
                    "code": kpi["code"],
                    "description": kpi.get("description", ""),
                    "measurement_type": kpi.get("measurement_type", "scale"),
                    "target_value": kpi.get("target_value"),
                    "target_unit": kpi.get("target_unit", ""),
                    "excellent_threshold": kpi.get("excellent_threshold"),
                    "good_threshold": kpi.get("good_threshold"),
                    "fair_threshold": kpi.get("fair_threshold"),
                    "collection_frequency": kpi.get("collection_frequency", "monthly"),
                    "weight": kpi.get("weight", 1.0),
                })
    
    return all_kpis


def get_dimension_summary():
    """Get a summary of all dimensions for UI display."""
    return {
        key: {
            "name": data["name"],
            "description": data["description"],
            "icon": data["icon"],
            "color": data["color"],
            "sub_dimensions": list(data.get("sub_dimensions", {}).keys()),
            "kpi_count": sum(
                len(sd.get("kpis", [])) 
                for sd in data.get("sub_dimensions", {}).values()
            )
        }
        for key, data in SOLAR_KPI_DEFINITIONS.items()
    }
