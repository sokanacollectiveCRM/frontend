import {
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
} from '@/common/components/ui/tabs';
import { Textarea } from '@/common/components/ui/textarea';
import { Label } from '@/common/components/ui/label';
import { Input } from '@/common/components/ui/input';
import { Card } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { useState } from 'react';

export default function ClientInfo({ client }: any) {
  const [birthDate, setBirthDate] = useState('');

  const handleBirthDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement birth date submission
    console.log('Birth date submitted:', birthDate);
  };

  return (
    <div className='w-full'>
      <Tabs defaultValue='Contact' className='w-full'>
        <TabsList className='mb-4 flex w-full'>
          <TabsTrigger value='Contact'>Contact</TabsTrigger>
          <TabsTrigger value='Health'>Health</TabsTrigger>
          <TabsTrigger value='Pregnancy'>Pregnancy</TabsTrigger>
          <TabsTrigger value='Birth'>Birth</TabsTrigger>
          <TabsTrigger value='PostBirth'>Post Birth</TabsTrigger>
        </TabsList>

        <TabsContent value='Contact'>
          <Card className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  type='email'
                  id='email'
                  placeholder='Email address'
                  defaultValue={client.user.email}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone</Label>
                <Input
                  type='tel'
                  id='phone'
                  placeholder='Phone number'
                  defaultValue='(630) 785-8457'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='address'>Address</Label>
                <Input
                  type='text'
                  id='address'
                  placeholder='Address'
                  defaultValue='845 Lincoln, Evanston'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='dob'>Date of Birth</Label>
                <Input
                  type='text'
                  id='dob'
                  placeholder='MM/DD/YYYY'
                  defaultValue='08/09/1992'
                />
              </div>
              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='contact-notes'>Additional Contact Notes</Label>
                <Textarea
                  id='contact-notes'
                  placeholder='Add any additional contact information here...'
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value='Health'>
          <Card className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='healthcare-provider'>Healthcare Provider</Label>
                <Input
                  type='text'
                  id='healthcare-provider'
                  placeholder='Primary healthcare provider'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='allergies'>Allergies</Label>
                <Input
                  type='text'
                  id='allergies'
                  placeholder='List any allergies'
                />
              </div>
              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='health-notes'>Health Notes</Label>
                <Textarea
                  id='health-notes'
                  placeholder='Add any additional health information here...'
                  className='min-h-32'
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value='Pregnancy'>
          <Card className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='due-date'>Due Date</Label>
                <Input
                  type='text'
                  id='due-date'
                  placeholder='MM/DD/YYYY'
                  defaultValue='June 15, 2025'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='week'>Current Week</Label>
                <Input
                  type='number'
                  id='week'
                  placeholder='Current week'
                  defaultValue='28'
                />
              </div>
              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='pregnancy-notes'>Pregnancy Notes</Label>
                <Textarea
                  id='pregnancy-notes'
                  placeholder='Add any pregnancy-related notes here...'
                  className='min-h-32'
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value='Birth'>
          <Card className='p-6'>
            <div className='grid grid-cols-1 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='birth-preferences'>Birth Preferences</Label>
                <Textarea
                  id='birth-preferences'
                  placeholder='Add birth preferences here...'
                  className='min-h-32'
                  defaultValue='Natural birth with minimal interventions'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='birth-environment'>Birth Environment</Label>
                <Textarea
                  id='birth-environment'
                  placeholder='Add birth environment preferences here...'
                  defaultValue='Dim lighting and calming music'
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value='PostBirth'>
          <Card className='p-6'>
            <div className='grid grid-cols-1 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='birth-date'>Baby's Birth Date</Label>
                <div className='flex gap-4'>
                  <Input
                    type='date'
                    id='birth-date'
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className='flex-1'
                  />
                  <Button onClick={handleBirthDateSubmit} disabled={!birthDate}>
                    Submit Birth Date
                  </Button>
                </div>
                <p className='text-sm text-gray-500 mt-1'>
                  Once submitted, the pregnancy timer will stop and the status
                  will be updated.
                </p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='postpartum-preferences'>
                  Postpartum Preferences
                </Label>
                <Textarea
                  id='postpartum-preferences'
                  placeholder='Add postpartum preferences here...'
                  className='min-h-32'
                  defaultValue='Immediate skin-to-skin contact'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lactation-support'>
                  Lactation/Feeding Support
                </Label>
                <Textarea
                  id='lactation-support'
                  placeholder='Add lactation/feeding preferences here...'
                  defaultValue='Client requested lactation support resources and referrals'
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
