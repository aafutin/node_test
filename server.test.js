const server = require('./server');
const expect = require('chai').expect;
const fse = require('fs-extra');
const path = require('path');
const http = require('http');

const filesFolder = path.resolve(__dirname, '../files');
const fixturesFolder = path.resolve(__dirname, './fixtures');

describe('http-server-streams/file-server-post', () => {
  describe('тесты на файловый сервер', () => {
    before((done) => {
      fse.emptyDirSync(filesFolder);
      server.listen(3001, done);
    });

    after((done) => {
      fse.emptyDirSync(filesFolder);
      fse.writeFileSync(path.join(filesFolder, '.gitkeep'), '');
      server.close(done);
    });

    beforeEach(() => {
      fse.emptyDirSync(filesFolder);
    });

    describe('POST', () => {
      it('при попытке создания слишком большого файла - ошибка 413', (done) => {
        const request = http.request(
            'http://localhost:3001/big.png',
            {method: 'POST'},
            (response) => {
              expect(
                  response.statusCode,
                  'статус код ответа сервера 413'
              ).to.equal(413);

              setTimeout(() => {
                expect(
                    fse.existsSync(path.join(filesFolder, 'big.png')),
                    'файл big.png не должен оставаться на диске'
                ).to.be.false;
                done();
              }, 100);
            });

        request.on('error', (err) => {
          // EPIPE/ECONNRESET error should occur because we try to pipe after res closed
          if (!['ECONNRESET', 'EPIPE'].includes(err.code)) done(err);
        });

        fse.createReadStream(path.join(fixturesFolder, 'big.png')).pipe(request);
      });
    });
  });
});
