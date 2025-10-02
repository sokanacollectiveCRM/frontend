import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Calendar, CheckCircle, Mail, MessageCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ContractSignedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const contractId = searchParams.get('contract_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            {/* Success Icon */}
            <div className="mx-auto mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Contract Successfully Signed! 🎉
            </CardTitle>
            <p className="text-lg text-gray-600">
              Your Postpartum Doula Services contract has been signed and is now active.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Contract Details */}
            {contractId && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Contract Details
                </h3>
                <p className="text-sm text-gray-600">
                  Contract ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{contractId}</span>
                </p>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                What's Next?
              </h3>
              <ul className="text-left text-blue-800 space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>You'll receive a copy of your signed contract via email</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Your doula will contact you to schedule your first session</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>If you have any questions, please contact us</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => window.open('mailto:info@sokanacollective.com', '_blank')}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Thank you for choosing our Postpartum Doula Services. We're excited to support you on your journey!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
