// Public config

var antiCapthaPredefinedApiKey = 'ee09917abe2540a87ff080d0d78abcc7';

var defaultConfig = {
    // settings
    enable: true,
    account_key: antiCapthaPredefinedApiKey,
    auto_submit_form: false,
    play_sounds: false,

    where_solve_list: [],
    where_solve_white_list_type: false, // true -- considered as white list, false -- black list

    solve_recaptcha2: true,
    solve_recaptcha3: true,
    recaptcha3_score: 0.3,
    solve_invisible_recaptcha: true,
    solve_funcaptcha: false, // off by default
    solve_geetest: true,
    solve_hcaptcha: true,
    use_predefined_image_captcha_marks: true,

    solve_proxy_on_tasks: false,
    user_proxy_protocol: 'HTTP',
    user_proxy_server: '',
    user_proxy_port: '',
    user_proxy_login: '',
    user_proxy_password: '',

    use_recaptcha_precaching: false,
    k_precached_solution_count_min: 2,
    k_precached_solution_count_max: 4,

    dont_reuse_recaptcha_solution: true,
    start_recaptcha2_solving_when_challenge_shown: false,
    solve_only_presented_recaptcha2: false,

    // use_recaptcha_accelerator: false,

    // status
    account_key_checked: antiCapthaPredefinedApiKey ? true : false, // set after account_key check
    free_attempts_left_count: 15 // move to config
};