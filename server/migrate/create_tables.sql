CREATE TABLE `ai_web_architect_project` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_key` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `dsl_snapshot_id` bigint(20) NOT NULL,
  `source_prd_content` longtext,
  `transformed_prd_content` longtext,
  `source_tech_constraints_content` longtext,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `ai_web_architect_snapshot` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_key` varchar(255) DEFAULT NULL,
  `dsl` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ai_web_architect_conversation` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unique_id` varchar(255) NOT NULL,
  `project_key` varchar(255) NOT NULL,
  `dsl_snapshot_before_id` bigint(20) NOT NULL,
  `dsl_snapshot_after_id` bigint(20) NOT NULL,
  `dsl_mutation_final` longtext,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `ai_web_architect_message` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_key` varchar(255) NOT NULL,
  `conversation_unique_id` varchar(255) NOT NULL,
  `dsl_snapshot_before_id` bigint(20) NOT NULL,
  `dsl_snapshot_after_id` bigint(20) NOT NULL,
  `deleted` tinyint(4) DEFAULT '0',
  `role` varchar(255) DEFAULT NULL,
  `content` longtext,
  `dsl_mutation` longtext,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;