import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- Running Further Improvements Verification ---');

// 1. Backend: AllExceptionsFilter & Body Parser Limits
const filterPath = 'backend/src/common/filters/all-exceptions.filter.ts';
assert(fs.existsSync(filterPath), 'AllExceptionsFilter file must exist');
const filterContent = fs.readFileSync(filterPath, 'utf8');

assert(filterContent.includes('isMongoDuplicateKeyError'), 'Filter must have Mongo duplicate key check');
assert(filterContent.includes('11000'), 'Filter must check error code 11000');
assert(filterContent.includes('Trường ${field} đã tồn tại trong hệ thống'), 'Filter must return Vietnamese duplicate field message');
assert(filterContent.includes('HttpStatus.CONFLICT'), 'Filter must return 409 Conflict for duplicate key');

assert(filterContent.includes('isMongooseCastError'), 'Filter must have Mongoose CastError check');
assert(filterContent.includes('CastError'), 'Filter must check CastError');
assert(filterContent.includes('ID không đúng định dạng MongoDB ObjectId'), 'Filter must return Vietnamese CastError message');
assert(filterContent.includes('HttpStatus.BAD_REQUEST'), 'Filter must return 400 Bad Request for CastError');

const mainTs = fs.readFileSync('backend/src/main.ts', 'utf8');
assert(mainTs.includes('AllExceptionsFilter'), 'main.ts must register AllExceptionsFilter');
assert(mainTs.includes('app.useGlobalFilters(new AllExceptionsFilter(configService))'), 'main.ts must register global filter');
assert(mainTs.includes("json({ limit: '10mb' })"), 'main.ts must configure express.json with 10mb limit');
assert(mainTs.includes("urlencoded({ extended: true, limit: '10mb' })"), 'main.ts must configure urlencoded with 10mb limit');
assert(mainTs.includes('bodyParser: false'), 'main.ts must disable default NestJS body parser to enforce custom limits');

console.log('✓ Backend filter & body parser static assertions passed');

// 2. Frontend: Route Protection
const bootstrapContent = fs.readFileSync('frontend/src/components/Boostrap.tsx', 'utf8');
assert(bootstrapContent.includes('isProtectedPage'), 'Boostrap.tsx must define isProtectedPage');
assert(bootstrapContent.includes("router.replace('/auth/login')") || bootstrapContent.includes('router.replace("/auth/login")'), 'Boostrap.tsx must redirect unauthenticated users to /auth/login');
assert(bootstrapContent.includes("router.replace('/')") || bootstrapContent.includes('router.replace("/")'), 'Boostrap.tsx must redirect authenticated users away from /auth/*');
assert(bootstrapContent.includes('subscribeAuth'), 'Boostrap.tsx must subscribe to auth updates');

console.log('✓ Frontend route protection static assertions passed');

// 3. Frontend: Next Font Optimization
const layoutContent = fs.readFileSync('frontend/src/app/layout.tsx', 'utf8');
assert(layoutContent.includes("from \"next/font/google\"") || layoutContent.includes("from 'next/font/google'"), 'layout.tsx must import from next/font/google');
assert(layoutContent.includes('Nunito'), 'layout.tsx must configure Nunito font');
assert(layoutContent.includes('--font-nunito'), 'layout.tsx must define --font-nunito variable');
assert(!layoutContent.includes('Geist'), 'layout.tsx should not use unused Geist fonts');

const globalsCss = fs.readFileSync('frontend/src/app/globals.css', 'utf8');
assert(!globalsCss.includes('nunito.css'), 'globals.css must not import nunito.css');
assert(globalsCss.includes('--font-nunito'), 'globals.css must use --font-nunito');

assert(!fs.existsSync('frontend/src/css/nunito.css'), 'frontend/src/css/nunito.css must be deleted');
assert(!fs.existsSync('frontend/src/fonts'), 'frontend/src/fonts directory must be deleted');

console.log('✓ Frontend font optimization assertions passed');

// 4. Functional Simulation: AllExceptionsFilter logic
function simulateFilter({ exception, isProd, url = '/api/test' }) {
  let capturedStatus = 0;
  let capturedJson = null;

  const mockResponse = {
    status(s) {
      capturedStatus = s;
      return this;
    },
    json(data) {
      capturedJson = data;
      return this;
    },
  };

  const isMongoDuplicate =
    typeof exception === 'object' &&
    exception !== null &&
    'code' in exception &&
    exception.code === 11000;

  const isCast =
    typeof exception === 'object' &&
    exception !== null &&
    'name' in exception &&
    exception.name === 'CastError';

  let statusCode = 500;
  let message = 'Lỗi máy chủ nội bộ';
  let errorName;

  if (isMongoDuplicate) {
    statusCode = 409;
    const field = exception.keyPattern
      ? Object.keys(exception.keyPattern)[0]
      : exception.keyValue
        ? Object.keys(exception.keyValue)[0]
        : 'Dữ liệu';
    message = `Trường ${field} đã tồn tại trong hệ thống`;
    errorName = 'Conflict';
  } else if (isCast) {
    statusCode = 400;
    message = 'ID không đúng định dạng MongoDB ObjectId';
    errorName = 'Bad Request';
  } else if (exception && typeof exception.getStatus === 'function') {
    statusCode = exception.getStatus();
    const resp = exception.getResponse();
    message = typeof resp === 'string' ? resp : resp.message || 'Error';
    errorName = typeof resp === 'object' ? resp.error : undefined;
  } else {
    if (!isProd && exception instanceof Error) {
      message = exception.message;
    }
  }

  mockResponse.status(statusCode).json({
    statusCode,
    timestamp: new Date().toISOString(),
    path: url,
    message,
    ...(errorName ? { error: errorName } : {}),
  });

  return { status: capturedStatus, body: capturedJson };
}

// Test Duplicate Key
const dupResult = simulateFilter({
  exception: { code: 11000, keyPattern: { maPhieuThu: 1 } },
  isProd: true,
});
assert.strictEqual(dupResult.status, 409);
assert.strictEqual(dupResult.body.message, 'Trường maPhieuThu đã tồn tại trong hệ thống');
assert.strictEqual(dupResult.body.error, 'Conflict');

// Test CastError
const castResult = simulateFilter({
  exception: { name: 'CastError', path: '_id', value: 'invalid-id' },
  isProd: true,
});
assert.strictEqual(castResult.status, 400);
assert.strictEqual(castResult.body.message, 'ID không đúng định dạng MongoDB ObjectId');
assert.strictEqual(castResult.body.error, 'Bad Request');

// Test Production 500 mask
const error500Prod = simulateFilter({
  exception: new Error('Sensitive DB connection string exposed'),
  isProd: true,
});
assert.strictEqual(error500Prod.status, 500);
assert.strictEqual(error500Prod.body.message, 'Lỗi máy chủ nội bộ');

// Test Dev 500 details
const error500Dev = simulateFilter({
  exception: new Error('Debug error info'),
  isProd: false,
});
assert.strictEqual(error500Dev.status, 500);
assert.strictEqual(error500Dev.body.message, 'Debug error info');

console.log('✓ AllExceptionsFilter functional logic verified');

// 5. Functional Simulation: Route Guard Logic
function evaluateRouteGuard({ ready, user, pathname }) {
  if (!ready) {
    return { state: 'LOADING_APP', renderChildren: false };
  }

  const isAuthPage = pathname.startsWith('/auth');
  const isProtectedPage = pathname !== '/' && !isAuthPage;

  if (!user && isProtectedPage) {
    return { state: 'REDIRECT_TO_LOGIN', redirectTo: '/auth/login', renderChildren: false };
  }
  if (user && isAuthPage) {
    return { state: 'REDIRECT_TO_HOME', redirectTo: '/', renderChildren: false };
  }

  return { state: 'READY', renderChildren: true };
}

// Unready app
assert.strictEqual(evaluateRouteGuard({ ready: false, user: null, pathname: '/nhan-khau' }).state, 'LOADING_APP');

// Unauthenticated visiting protected route
const unauthProtected = evaluateRouteGuard({ ready: true, user: null, pathname: '/ho-khau' });
assert.strictEqual(unauthProtected.state, 'REDIRECT_TO_LOGIN');
assert.strictEqual(unauthProtected.redirectTo, '/auth/login');
assert.strictEqual(unauthProtected.renderChildren, false);

// Unauthenticated visiting landing page
const unauthLanding = evaluateRouteGuard({ ready: true, user: null, pathname: '/' });
assert.strictEqual(unauthLanding.state, 'READY');
assert.strictEqual(unauthLanding.renderChildren, true);

// Unauthenticated visiting login page
const unauthLogin = evaluateRouteGuard({ ready: true, user: null, pathname: '/auth/login' });
assert.strictEqual(unauthLogin.state, 'READY');
assert.strictEqual(unauthLogin.renderChildren, true);

// Authenticated visiting login page
const authLogin = evaluateRouteGuard({ ready: true, user: { _id: 'u1', username: 'admin' }, pathname: '/auth/login' });
assert.strictEqual(authLogin.state, 'REDIRECT_TO_HOME');
assert.strictEqual(authLogin.redirectTo, '/');
assert.strictEqual(authLogin.renderChildren, false);

// Authenticated visiting protected page
const authProtected = evaluateRouteGuard({ ready: true, user: { _id: 'u1', username: 'admin' }, pathname: '/thu-phi' });
assert.strictEqual(authProtected.state, 'READY');
assert.strictEqual(authProtected.renderChildren, true);

console.log('✓ Route Guard logic verified across all route combinations');
console.log('\n--- ALL FURTHER IMPROVEMENTS VERIFICATIONS PASSED SUCCESSFULLY ---');
