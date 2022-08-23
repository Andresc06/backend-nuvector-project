const pool = require("../db");
const authorization = require("../middleware/authorization");
const router = require("./jws.routes");


// DASHBOARD
router.get('/', authorization, async(req, res) => {
    try {
        
        // The req.user has the payload 
        const user = await pool.query("SELECT name FROM users WHERE code_uid = $1", [
            req.user
        ]);

        res.json(user.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// CONSULTA PROJECT
router.get('/projects', authorization, async(req, res) => {
    try {
        
        // The req.user has the payload 
        const project = await pool.query("SELECT * from projects");

        res.json(project.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// CONSULTA PROJECTS PARA USUARIO
router.get('/projects/simple', authorization, async(req, res) => {
    try {
        
        let cons = `SELECT cl.name as client, p.name as name, p.description as description, p.actual_status as actual_status
        FROM (projects as p INNER JOIN clientele as cl ON cl.code_uid = p.client_uid)`

        const project = await pool.query(cons);

        res.json(project.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// OBTENER NOMBRES CLIENTES
router.get('/clientele/names', authorization, async(req, res) => {
    try {
        
        // The req.user has the payload 
        const project = await pool.query("SELECT code_uid, name from clientele");

        res.json(project.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// AÑADIR UN PROJECT
router.post('/projects/add', authorization, async(req, res) => {
    try {

        const { client, name, description, actual_status } = req.body;
        
        const cons1 = `SELECT code_uid FROM clientele WHERE name='${client}'`;

        const queryName = await pool.query(cons1);

        const result = queryName.rows[0];

        const cons2 = `INSERT INTO projects (client_uid, name, description, actual_status) VALUES ('${result.code_uid}', '${name}', '${description}', '${actual_status}');`;

        const addProject = await pool.query(cons2);
    
        res.json(addProject.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// OBTENER PROJECT DADO EL ID
router.get('/projects/:id', authorization, async(req, res) => {
    try {

        const { id } = req.params;

        const projects = await pool.query("SELECT * FROM projects WHERE code_uid= $1", [
            id
        ]);
        res.json(projects.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// EDITAR UN PROJECT
router.put('/projects/:id/edit', authorization, async(req, res) => {
    try {

        const { id } = req.params;
        const { field, value } = req.body;

        const cons = "UPDATE projects SET " + field + "= '" + value + "' WHERE code_uid= '" + id + "'";

        const updateProject = await pool.query(cons);
        
        res.json(updateProject.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// ELIMINAR DE PROJECT
router.delete('/projects/:id/delete', authorization, async(req, res) => {
    try {

        const { id } = req.params;

        const cons = `BEGIN;
        DELETE FROM chores WHERE project_uid= '${id}';
        DELETE FROM chores WHERE product_uid IN (SELECT code_uid FROM products WHERE project_uid='${id}');
        DELETE FROM products WHERE project_uid='${id}';
        DELETE FROM activities WHERE project_uid='${id}';
        DELETE FROM projects WHERE code_uid='${id}';
        COMMIT;`;

        await pool.query(cons);
        
        res.status(200).json("Project Deleted");

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// CONSULTA PROJECT PARA GRAFICA
router.get('/project/graph', authorization, async(req, res) => {
    try {
        
        // The req.user has the payload 
        const project = await pool.query(`SELECT pr.description as project, SUM(duration) as total_duration
                                        FROM (chores as c
                                        INNER JOIN projects as pr ON pr.code_uid = c.project_uid
                                        INNER JOIN products as pd ON pd.project_uid = pr.code_uid)
                                        GROUP BY project;`);

        res.json(project.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// CONSULTA ESPECIALIZADA PROJECT DADA DATE RANGE
router.get('/project/graph/custom/:start/:end', authorization, async(req, res) => {
    try {
        
        const { start, end } = req.params;

        let cons = `SELECT pr.description as project, SUM(duration) as total_duration
        FROM (chores as c
        INNER JOIN projects as pr ON pr.code_uid = c.project_uid
        INNER JOIN products as pd ON pd.project_uid = pr.code_uid)
        WHERE c.entry_date > '${start}' AND c.entry_date < '${end}'
        GROUP BY project`;
        // The req.user has the payload 
        const project = await pool.query(cons);

        res.json(project.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// CONSULTA ESPECIALIZADA DE PROJECT DADO CLIENTE
router.get('/project/graph/custom/:client', authorization, async(req, res) => {
    try {
        
        const { client } = req.params;

        let cons = `SELECT pr.description as project, SUM(duration) as total_duration
        FROM (chores as c
        INNER JOIN projects as pr ON pr.code_uid = c.project_uid
        INNER JOIN products as pd ON pd.project_uid = pr.code_uid)
        WHERE pr.client_uid = '${client}'
        GROUP BY project`;
        // The req.user has the payload 
        const project = await pool.query(cons);

        res.json(project.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// CONSULTA ESPECIALIZADA DE PROJECT DADO DATE RANGE Y CLIENTE
router.get('/project/graph/custom/:start/:end/:client', authorization, async(req, res) => {
    try {
        
        const { start, end, client } = req.params;

        let cons = `SELECT pr.description as project, SUM(duration) as total_duration
        FROM (chores as c
        INNER JOIN projects as pr ON pr.code_uid = c.project_uid
        INNER JOIN products as pd ON pd.project_uid = pr.code_uid)
        WHERE c.entry_date > '${start}' AND c.entry_date < '${end}'
        AND pr.client_uid = '${client}'
        GROUP BY project`;
        // The req.user has the payload 
        const project = await pool.query(cons);

        res.json(project.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})


// CONSULTAR TASK ENTRIES GENERAL
router.get('/task_entries', authorization, async(req, res) => {
    try {

        const cons = `SELECT c.entry_code as entry_code, CONCAT(ctr.first_name, ' ', ctr.last_name) AS contractor, 
        c.entry_date as entry_date, c.duration as duration, c.bill_flag as bill_flag, pr.name as project, act.description as activity, 
        pr.name as product, cl.name as client, pd.description as product, ct.description as category, c.task_description as task_description
        FROM (chores as c
        INNER JOIN activities as act ON act.code_uid = c.activity_uid
        INNER JOIN categories as ct ON ct.code_uid = c.category_uid
        INNER JOIN contractors as ctr ON ctr.code_uid = c.contractor_uid
        INNER JOIN projects as pr ON pr.code_uid = c.project_uid
        INNER JOIN clientele as cl ON cl.code_uid = pr.client_uid
        INNER JOIN products as pd ON pd.project_uid = pr.code_uid);`
        
        // The req.user has the payload 
        const chores = await pool.query(cons);

        res.json(chores.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// CONSULTAR TASK ENTRIES
router.get('/task_entries/:id', authorization, async(req, res) => {
    try {

        const { id } = req.params;

        const chores = await pool.query("SELECT * FROM chores WHERE entry_code= $1", [
            id
        ]);
        res.json(chores.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// ELIMINAR TASK ENTRIES
router.delete('/task_entries/:id/delete', authorization, async(req, res) => {
    try {

        const { id } = req.params;

        const cons = `DELETE FROM chores WHERE entry_code= '${id}'`;

        await pool.query(cons);
        
        res.status(200).json("Chore Deleted");

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// EDITAR TASK ENTRIES
router.put('/task_entries/:id/edit', authorization, async(req, res) => {
    try {

        const { id } = req.params;
        const { field, value } = req.body;

        const cons = "UPDATE chores SET " + field + "= '" + value + "' WHERE entry_code= '" + id + "'";

        const updateChores = await pool.query(cons);
        
        res.json(updateChores.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

// AÑADIR TASK ENTRIES
router.post('/task_entries/add', authorization, async(req, res) => {
    try {

        const { contractor, date, duration, bill, activity, project, product, category, task_description } = req.body;

        const cons = `INSERT INTO chores (contractor_uid, entry_date, duration, bill_flag, activity_uid, project_uid, product_uid, category_uid, task_description) VALUES ('${contractor}', '${date}', '${duration}', '${bill}', '${activity}', '${project}', '${product}', '${category}', '${task_description}');`;

        const addTaskEntries = await pool.query(cons);
    
        res.json(addTaskEntries.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

module.exports = router;