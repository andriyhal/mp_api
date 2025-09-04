create table average_health_data
(
    id                    int auto_increment
        primary key,
    sex                   smallint not null,
    age_from              smallint not null,
    age_to                smallint not null,
    weight                decimal  not null,
    height                decimal  not null,
    waist                 decimal  not null,
    BP_Systolic           decimal  not null,
    BP_Diastolic          decimal  not null,
    Fasting_Blood_Glucose decimal  not null,
    HDL_Cholesterol       decimal  not null,
    Triglycerides         decimal  not null
);

create table biomarkers
(
    id          int auto_increment
        primary key,
    name        varchar(255) not null,
    description text         not null,
    constraint name
        unique (name)
)
    charset = latin1;

create table biomarker_scores
(
    id           int auto_increment
        primary key,
    biomarker_id int            not null,
    range_from   decimal(10, 2) null,
    range_to     decimal(10, 2) null,
    score        int            not null,
    constraint biomarker_scores_ibfk_1
        foreign key (biomarker_id) references biomarkers (id)
)
    charset = latin1;

create index idx_biomarker_scores_biomarker
    on biomarker_scores (biomarker_id);

create table data_upload
(
    id          int auto_increment
        primary key,
    UserID      varchar(50)                         not null,
    filename    varchar(255)                        not null,
    data        longtext                            not null,
    uploaded_at timestamp default CURRENT_TIMESTAMP not null,
    file_type   varchar(10)                         not null,
    file_path   varchar(255)                        not null,
    ocr_text    mediumtext                          null
)
    charset = latin1;

create table digital_items
(
    id          int auto_increment
        primary key,
    name        varchar(255)                                   not null,
    description text                                           not null,
    type        enum ('sport', 'stress', 'nutrition', 'other') not null,
    image_url   varchar(512)                                   null,
    content_url varchar(512)                                   null,
    created_at  timestamp default CURRENT_TIMESTAMP            not null
)
    charset = latin1;

create table digital_plans
(
    id          int auto_increment
        primary key,
    name        varchar(255)                        not null,
    description text                                null,
    created_at  timestamp default CURRENT_TIMESTAMP not null
)
    charset = latin1;

create table biomarker_plan_score
(
    id           int auto_increment
        primary key,
    biomarker_id int not null,
    score        int not null,
    plan_id      int not null,
    constraint fk_biomarker_plan_score
        foreign key (plan_id) references digital_plans (id),
    constraint fk_biomarker_score
        foreign key (biomarker_id) references biomarkers (id)
)
    charset = latin1;

create table digital_plan_items
(
    id         int auto_increment
        primary key,
    plan_id    int not null,
    item_id    int not null,
    day_offset int not null,
    constraint fk_item
        foreign key (item_id) references digital_items (id),
    constraint fk_plan
        foreign key (plan_id) references digital_plans (id)
)
    charset = latin1;

create table expertise_types
(
    id          int auto_increment
        primary key,
    name        varchar(255) not null,
    description text         null
)
    charset = latin1;

create table biomarker_expertise_score
(
    id                int auto_increment
        primary key,
    biomarker_id      int not null,
    score             int not null,
    expertise_type_id int not null,
    constraint fk_bioexp_score_bio
        foreign key (biomarker_id) references biomarkers (id),
    constraint fk_bioexp_score_exp
        foreign key (expertise_type_id) references expertise_types (id)
)
    charset = latin1;

create table health_data
(
    id                     int auto_increment
        primary key,
    UserID                 varchar(50)                         not null,
    Weight                 decimal(5, 2)                       not null,
    BloodPressureSystolic  int                                 not null,
    BloodPressureDiastolic int                                 not null,
    FastingBloodGlucose    int                                 not null,
    HDLCholesterol         int                                 not null,
    Triglycerides          int                                 not null,
    CreatedAt              timestamp default CURRENT_TIMESTAMP not null,
    height                 decimal(5, 2)                       not null,
    waistCircumference     decimal(5, 2)                       not null,
    vitaminD2              decimal(5, 2)                       null,
    vitaminD3              decimal(5, 2)                       null
)
    charset = latin1;

create table products
(
    id             int auto_increment
        primary key,
    name           varchar(255)                                     not null,
    description    text                                             not null,
    type           enum ('digital', 'supplement', 'food', 'device') not null,
    price          decimal(10, 2)                                   not null,
    image_url      varchar(512)                                     null,
    digital_url    varchar(512)                                     null,
    public_visible tinyint(1) default 0                             not null,
    created_at     timestamp  default CURRENT_TIMESTAMP             not null
)
    charset = latin1;

create table product_biomarker_score
(
    id           int auto_increment
        primary key,
    product_id   int           not null,
    biomarker_id int           not null,
    score        int           not null,
    priority     int default 1 null,
    constraint product_biomarker_score_ibfk_1
        foreign key (product_id) references products (id),
    constraint product_biomarker_score_ibfk_2
        foreign key (biomarker_id) references biomarkers (id)
)
    charset = latin1;

create index idx_product_biomarker_score_biomarker
    on product_biomarker_score (biomarker_id);

create index idx_product_biomarker_score_score
    on product_biomarker_score (score);

create index product_id
    on product_biomarker_score (product_id);

create table product_reviews
(
    id         int auto_increment
        primary key,
    product_id int                                 not null,
    user_id    varchar(50)                         null,
    rating     int                                 not null,
    review     text                                null,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    constraint product_reviews_ibfk_1
        foreign key (product_id) references products (id)
)
    charset = latin1;

create table providers
(
    id                int auto_increment
        primary key,
    name              varchar(255) not null,
    title             varchar(50)  null,
    image_url         varchar(512) null,
    booking_url       varchar(512) null,
    expertise_type_id int          not null,
    constraint fk_expertise_type
        foreign key (expertise_type_id) references expertise_types (id)
)
    charset = latin1;

create table recommendations
(
    id           int auto_increment
        primary key,
    biomarker_id int                                                                     not null,
    range_from   decimal(10, 2)                                                          not null,
    range_to     decimal(10, 2)                                                          not null,
    type         enum ('supplement', 'activity', 'action', 'keto', 'paleo', 'carnivore') not null,
    description  text                                                                    not null,
    constraint recommendations_ibfk_1
        foreign key (biomarker_id) references biomarkers (id)
)
    charset = latin1;

create index biomarker_id
    on recommendations (biomarker_id);

create table user_digital_plans
(
    id          int auto_increment
        primary key,
    user_id     varchar(50)                         not null,
    plan_id     int                                 not null,
    assigned_at timestamp default CURRENT_TIMESTAMP not null,
    constraint fk_user_plan
        foreign key (plan_id) references digital_plans (id)
)
    charset = latin1;

create table user_digital_plan_items
(
    id             int auto_increment
        primary key,
    user_plan_id   int                  not null,
    item_id        int                  not null,
    scheduled_date date                 not null,
    completed      tinyint(1) default 0 null,
    constraint fk_user_item
        foreign key (item_id) references digital_items (id),
    constraint fk_user_plan_item
        foreign key (user_plan_id) references user_digital_plans (id)
)
    charset = latin1;

create table user_expertise_types
(
    id                int auto_increment
        primary key,
    user_id           varchar(50)                         not null,
    expertise_type_id int                                 not null,
    assigned_at       timestamp default CURRENT_TIMESTAMP not null,
    constraint fk_userexp_exp
        foreign key (expertise_type_id) references expertise_types (id)
)
    charset = latin1;

create table user_scores
(
    id            int auto_increment
        primary key,
    user_id       varchar(50)                         not null,
    biomarker_id  int                                 not null,
    score         int                                 not null,
    calculated_at timestamp default CURRENT_TIMESTAMP null,
    constraint uk_user_biomarker
        unique (user_id, biomarker_id),
    constraint user_scores_ibfk_1
        foreign key (biomarker_id) references biomarkers (id)
)
    charset = latin1;

create index idx_user_scores_biomarker
    on user_scores (biomarker_id);

create index idx_user_scores_user
    on user_scores (user_id);

create table users
(
    UserID               varchar(50)                         not null
        primary key,
    Sex                  enum ('Male', 'Female', 'Other')    not null,
    DateOfBirth          date                                not null,
    password             varchar(255)                        not null,
    name                 varchar(255)                        not null,
    login_attempts       int       default 0                 null,
    last_login_attempt   timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    general_health_score decimal(5, 2)                       null
)
    charset = latin1;

create table login_history
(
    id         int auto_increment
        primary key,
    UserID     varchar(50)                         not null,
    login_time timestamp default CURRENT_TIMESTAMP not null,
    success    tinyint(1)                          not null,
    constraint login_history_ibfk_1
        foreign key (UserID) references users (UserID)
)
    charset = latin1;

create index UserID
    on login_history (UserID);
