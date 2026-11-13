const db = require('../config/database');
const authenticate = require('./authenticate');

const authorizationQuery = `
	SELECT
		r.rolename AS role,
		COALESCE(BOOL_OR(rp.canread), FALSE) AS "canRead",
		COALESCE(BOOL_OR(rp.canwrite), FALSE) AS "canWrite"
	FROM worker w
	JOIN role r ON r.rolename = w.role
	LEFT JOIN role_permissions rp ON rp.roleid = r.roleid
	LEFT JOIN permission p
		ON p.permissionid = rp.permissionid
		AND p.permissionname = $2
	WHERE w.userid = $1
	GROUP BY r.rolename
`;

const permissionByMethod = {
	GET: 'canRead',
	HEAD: 'canRead',
	POST: 'canWrite',
	PUT: 'canWrite',
	PATCH: 'canWrite',
	DELETE: 'canWrite',
};

const permissionByPath = {
	Works: ['/works', '/work-orders'],
	Production: ['/production', '/stages', '/stage-records'],
	Clients: ['/clients'],
	Collaborators: ['/collaborators', '/workers'],
	'Internal notes': ['/internal-notes', '/notes'],
	'Shared documents': ['/shared-documents', '/documents', '/files'],
	Communication: ['/communication', '/messages'],
	Catalogs: ['/catalogs', '/work-types', '/materials', '/teeth', '/colors'],
};

function permissionForPath(requestPath) {
	const normalizedPath = requestPath.replace(/\/+$/, '') || '/';
	return Object.entries(permissionByPath).find(([, paths]) =>
		paths.some((path) => normalizedPath === path || normalizedPath.startsWith(`${path}/`))
	)?.[0];
}

function authorize(req, res, next) {
	return authenticate(req, res, async () => {
		// authenticate validates the token; this check ensures its payload identifies a user for the database lookup.
		const userId = req.user?.user ?? req.user?.id;
		if (!userId) {
			return res.status(401).json({ error: 'User ID missing from authentication token' });
		}

		const permission = permissionByMethod[req.method];
		if (!permission) {
			return res.status(403).json({ error: 'Request method is not authorized' });
		}

		const requestPath = `${req.baseUrl || ''}${req.path}`;
		const resource = permissionForPath(requestPath);
		if (!resource) {
			return res.status(403).json({ error: 'Request path is not authorized' });
		}

		try {
			const { rows } = await db.query(authorizationQuery, [userId, resource]);
			const authorization = rows[0];

			// A base de dados é quem controla a role do usuário. Se a role do usuário mudou, o token de autenticação é inválido e o usuário deve se autenticar novamente.
			if (req.user.role && authorization?.role !== req.user.role) {
				res.clearCookie('token', { httpOnly: true, secure: true });
				return res.status(403).json({ error: 'Role changed; authenticate again' });
			}

			if (!authorization || authorization[permission] !== true) {
				return res.status(403).json({ error: 'Insufficient permissions' });
			}

			req.authorization = { role: authorization.role, resource, permission, path: requestPath };
			return next();
		} catch (error) {
			return next(error);
		}
	});
}

module.exports = authorize;
